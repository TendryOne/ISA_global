const Schedule = require("../models/schedule.model");
const mongoose = require("mongoose");
const Module = require("../models/module.model");
const Promotion = require("../models/promotion.model");
const TeachingUnit = require("../models/teachingUnit.model");
class ScheduleQueries {
  constructor() {
    this.model = Schedule;
  }

  async GetScheduleByRange(
    startDate,
    endDate,
    { professorId = null, promotionId = null } = {}
  ) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      let query = { date: { $gte: start, $lte: end } };

      if (professorId)
        query.professor = new mongoose.Types.ObjectId(professorId);
      if (promotionId)
        query.promotions = new mongoose.Types.ObjectId(promotionId);

      // Agrégation optimisée avec projections ciblées
      const pipeline = [
        { $match: query },

        // Lookup professor avec projection ciblée
        {
          $lookup: {
            from: "users",
            localField: "professor",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  firstName: 1,
                  email: 1,
                  isPermanent: 1,
                  phone: 1,
                },
              },
            ],
            as: "professor",
          },
        },
        { $unwind: { path: "$professor", preserveNullAndEmptyArrays: true } },

        // Lookup module
        {
          $lookup: {
            from: "modules",
            localField: "module",
            foreignField: "_id",
            as: "module",
          },
        },
        { $unwind: { path: "$module", preserveNullAndEmptyArrays: true } },

        // Lookup createdBy avec projection ciblée
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  firstName: 1,
                  email: 1,
                },
              },
            ],
            as: "createdBy",
          },
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

        // Lookup studentReclamations avec projection ciblée
        {
          $lookup: {
            from: "users",
            localField: "studentReclamations",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  matricule: 1,
                },
              },
            ],
            as: "studentReclamations",
          },
        },

        // Lookup approvedManuallyAfterCronBy avec projection ciblée
        {
          $lookup: {
            from: "users",
            localField: "approvedManuallyAfterCronBy",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  firstName: 1,
                  matricule: 1,
                },
              },
            ],
            as: "approvedManuallyAfterCronBy",
          },
        },
        {
          $unwind: {
            path: "$approvedManuallyAfterCronBy",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup modifiedBy avec projection ciblée
        {
          $lookup: {
            from: "users",
            localField: "modifiedBy",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  firstName: 1,
                  email: 1,
                },
              },
            ],
            as: "modifiedBy",
          },
        },
        { $unwind: { path: "$modifiedBy", preserveNullAndEmptyArrays: true } },

        // Tri par date décroissante
        { $sort: { date: -1, startTime: -1 } },
      ];

      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw error;
    }
  }

  async createSchedule(data) {
    try {
      const newSchedule = new this.model(data);
      const savedDoc = await newSchedule.save();
      return await this.model
        .findById(savedDoc._id)
        .populate("professor", "name firstName email isPermanent")
        .populate("module")
        .populate("createdBy")
        .lean();
    } catch (error) {
      throw error;
    }
  }

  async CheckProfessorDisponibilities(
    professorId,
    startTime,
    endTime,
    date,
    excludeId = null
  ) {
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Construire la query
      const query = {
        professor: professorId,
        date: new Date(date),
      };

      if (excludeId) {
        query._id = { $ne: excludeId }; // exclure la séance qu’on modifie
      }

      const schedules = await this.model.find(query);

      // Liste des créneaux qui posent problème
      const conflicts = [];

      for (const s of schedules) {
        const [sH, sM] = s.startTime.split(":").map(Number);
        const [eH, eM] = s.endTime.split(":").map(Number);

        const sStart = sH * 60 + sM;
        const sEnd = eH * 60 + eM;

        if (startMinutes < sEnd && endMinutes > sStart) {
          conflicts.push({
            startTime: s.startTime,
            endTime: s.endTime,
            date: s.date,
          });
        }
      }

      return conflicts;
    } catch (error) {
      throw error;
    }
  }

  async checkPromotionsDisponibilities(
    promotionIds,
    startTime,
    endTime,
    date,
    excludeId = null
  ) {
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Début et fin de journée
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Construire la query
      const query = {
        promotions: { $in: promotionIds },
        date: { $gte: startOfDay, $lte: endOfDay },
      };

      if (excludeId) {
        query._id = { $ne: excludeId }; // <-- exclure la séance en cours de modif
      }

      // Récupérer toutes les séances du jour qui concernent les promotions données
      const schedules = await this.model
        .find(query)
        .populate("promotions", "name");

      const conflicts = [];

      for (const s of schedules) {
        const [sH, sM] = s.startTime.split(":").map(Number);
        const [eH, eM] = s.endTime.split(":").map(Number);
        const sStart = sH * 60 + sM;
        const sEnd = eH * 60 + eM;

        // Chevauchement de créneau
        if (startMinutes < sEnd && endMinutes > sStart) {
          conflicts.push({
            startTime: s.startTime,
            endTime: s.endTime,
            date: s.date,
            promotions: s.promotions.map((p) => ({
              _id: p._id,
              name: p.name,
            })),
          });
        }
      }

      return conflicts;
    } catch (error) {
      throw error;
    }
  }

  async checkRoomDisponibilities(
    roomName,
    startTime,
    endTime,
    date,
    excludeId = null
  ) {
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // Construire la query
      const query = {
        room: roomName,
        date: new Date(date),
      };

      if (excludeId) {
        query._id = { $ne: excludeId }; // exclure la séance qu’on est en train de modifier
      }

      const schedules = await this.model.find(query);

      // Liste des créneaux qui posent problème
      const conflicts = [];

      for (const s of schedules) {
        const [sH, sM] = s.startTime.split(":").map(Number);
        const [eH, eM] = s.endTime.split(":").map(Number);

        const sStart = sH * 60 + sM;
        const sEnd = eH * 60 + eM;

        if (startMinutes < sEnd && endMinutes > sStart) {
          conflicts.push({
            startTime: s.startTime,
            endTime: s.endTime,
            date: s.date,
          });
        }
      }

      return conflicts;
    } catch (error) {
      throw error;
    }
  }

  async updateScheduleStatus(scheduleId, status, approvedByCron = false) {
    try {
      return await this.model.findByIdAndUpdate(
        scheduleId,
        {
          status,
          approvedByCron,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async getPendingSchedulesByDateRange(startDate, endDate) {
    try {
      return await this.model
        .find({
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: "pending",
          approvedByCron: false,
        })
        .populate("professor", "name firstName email")
        .populate("module", "name code")
        .populate("promotions", "name year");
    } catch (error) {
      throw error;
    }
  }

  async updateScheduleStatusManually(scheduleId, ApproverId) {
    try {
      return await this.model
        .findOneAndUpdate(
          { _id: scheduleId, approvedByCron: true, status: "missed" },
          {
            status: "done",
            approvedManuallyAfterCronBy: ApproverId,
            approvedByCron: false,
          },
          { new: true }
        )
        .populate("approvedManuallyAfterCronBy", "name firstName matricule")
        .populate("professor", "name firstName email isPermanent phone")
        .populate("module")
        .populate("createdBy", "name firstName email ")
        .populate("studentReclamations", "matricule")
        .populate("modifiedBy", "name firstName email ");
    } catch (error) {
      throw new Error(
        "La séance doit être approuvée par le cron et marquée comme manquée avant une approbation manuelle."
      );
    }
  }

  async deleteSchedule(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async GetScheduleById(scheduleId) {
    try {
      return await this.model.findById(scheduleId);
    } catch (error) {
      throw error;
    }
  }

  async UpdateScheduleById(id, update) {
    try {
      return await this.model
        .findByIdAndUpdate(id, update, { new: true })
        .populate("approvedManuallyAfterCronBy", "name firstName matricule")
        .populate("professor", "name firstName email isPermanent phone")
        .populate("module")
        .populate("createdBy", "name firstName email ")
        .populate("studentReclamations", "matricule")
        .populate("modifiedBy", "name firstName email ");
    } catch (error) {
      throw error;
    }
  }

  async getAllScheduleDone(promotionIds, professorId) {
    try {
      return await this.model
        .find({
          promotions: { $in: promotionIds },
          professor: professorId,
          status: "done",
        })
        .populate("module", "-files -description")
        .populate("promotions", "name")
        .select("date startTime endTime duration promotions");
    } catch (error) {
      throw error;
    }
  }

  async getProfProgression(
    promotionIds,
    professorId,
    { from = null, to = null } = {}
  ) {
    try {
      const promotionObjectIds = promotionIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const professorObjectId = new mongoose.Types.ObjectId(professorId);
      const promotionSet = new Set(
        promotionObjectIds.map((id) => id.toString())
      );

      const query = {
        professor: professorObjectId,
        promotions: { $in: promotionObjectIds },
      };
      if (from || to) {
        const d = {};
        if (from) d.$gte = new Date(from);
        if (to) d.$lte = new Date(to);
        query.date = d;
      }

      // 1) Récupérer les séances minimales
      const schedules = await this.model
        .find(query)
        .select("module promotions date startTime endTime duration status")
        .lean();

      if (!schedules.length) return [];

      // 2) Collecter les ids modules et promotions réellement utilisés (intersection)
      const moduleIdsSet = new Set();
      const usedPromotionIdsSet = new Set();
      for (const s of schedules) {
        if (s.module) moduleIdsSet.add(s.module.toString());
        if (Array.isArray(s.promotions)) {
          for (const p of s.promotions) {
            const pid = p.toString();
            if (promotionSet.has(pid)) usedPromotionIdsSet.add(pid);
          }
        }
      }

      const moduleIds = Array.from(moduleIdsSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const usedPromotionIds = Array.from(usedPromotionIdsSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // 3) Lookup modules et promotions (métadonnées)
      const [modules, promotions] = await Promise.all([
        Module.find({ _id: { $in: moduleIds } })
          .select("title name code coefficient credits hours")
          .lean(),
        Promotion.find({ _id: { $in: usedPromotionIds } })
          .select("name")
          .lean(),
      ]);

      const modulesMap = new Map(modules.map((m) => [m._id.toString(), m]));
      const promotionsMap = new Map(
        promotions.map((p) => [p._id.toString(), p])
      );

      // 4) Regrouper par (moduleId, promotionId)
      const byKey = new Map();
      for (const s of schedules) {
        const modId = s.module?.toString();
        if (!modId) continue;

        // Intersect avec la liste des promotions demandées
        const promos = (s.promotions || [])
          .map((x) => x.toString())
          .filter((x) => promotionSet.has(x));

        // Sanity-check de la durée
        const dur = Number(s.duration) || 0; // on suppose que la validation (30–240 min) est faite à la création
        const isDone = s.status === "done";

        for (const promoId of promos) {
          const key = `${modId}|${promoId}`;
          let item = byKey.get(key);
          if (!item) {
            const m = modulesMap.get(modId) || {};
            const p = promotionsMap.get(promoId) || {};
            item = {
              moduleId: modId,
              title: m.title || m.name || "",
              code: m.code || "",
              coefficient:
                typeof m.coefficient === "number" ? m.coefficient : 1,
              credits: typeof m.credits === "number" ? m.credits : 0,
              promotion: { _id: promoId, name: p.name || "" },
              hoursPlanned: m.hours,
              hoursDone: 0,
              sessions: [],
            };
            byKey.set(key, item);
          }

          if (isDone) item.hoursDone += dur;

          // Sessions (pour l’interface)
          item.sessions.push({
            _id: s._id,
            date: s.date,
            duration: dur,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
          });
        }
      }

      // 5) Conversion en tableau et tri (optionnel)
      const result = Array.from(byKey.values()).map((x) => ({
        ...x,
        moduleId: x.moduleId.toString(),
        promotion: { _id: x.promotion._id.toString(), name: x.promotion.name },
      }));

      result.sort((a, b) => {
        const t = (a.title || "").localeCompare(b.title || "");
        if (t !== 0) return t;
        return (a.promotion.name || "").localeCompare(b.promotion.name || "");
      });

      return result;
    } catch (error) {
      console.error(
        "[Schedule Queries] getProfProgression (find-based) error:",
        error
      );
      throw error;
    }
  }

  async getPromotionProgression(
    promotionId,
    { from = null, to = null, semester = null } = {}
  ) {
    try {
      const promotionObjectId = new mongoose.Types.ObjectId(promotionId);

      // 1) Récupérer les infos de la promotion (1 seule requête)
      const promotion = await Promotion.findById(promotionObjectId)
        .select("name field level")
        .lean();

      if (!promotion) {
        throw new Error("Promotion non trouvée");
      }

      // 2) Construire le filtre pour TeachingUnits
      const matchFilter = {
        field: promotion.field,
        level: promotion.level,
      };

      // Ajouter le filtre semestre si fourni
      if (semester) {
        matchFilter.semester = semester;
      }

      // 3) Agrégation optimisée : récupérer modules + sessions en une seule requête
      const pipeline = [
        // Trouver les TeachingUnits du field/level/semester
        {
          $match: matchFilter,
        },
        // Lookup des modules
        {
          $lookup: {
            from: "modules",
            localField: "_id",
            foreignField: "teachingUnit",
            as: "modules",
          },
        },
        // Unwind pour traiter chaque module
        { $unwind: "$modules" },
        // Lookup des sessions pour ce module + promotion
        {
          $lookup: {
            from: "schedules",
            let: { moduleId: "$modules._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$module", "$$moduleId"] },
                      { $in: [promotionObjectId, "$promotions"] },
                      ...(from ? [{ $gte: ["$date", new Date(from)] }] : []),
                      ...(to ? [{ $lte: ["$date", new Date(to)] }] : []),
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  date: 1,
                  duration: 1,
                  startTime: 1,
                  endTime: 1,
                  status: 1,
                },
              },
            ],
            as: "sessions",
          },
        },
        // Projection finale
        {
          $project: {
            _id: 0,
            moduleId: "$modules._id",
            title: { $ifNull: ["$modules.title", "$modules.name"] },
            code: "$modules.code",
            coefficient: "$modules.coefficient",
            credits: "$modules.credits",
            hoursPlanned: "$modules.hours",
            sessions: 1,
          },
        },
      ];

      const results = await TeachingUnit.aggregate(pipeline);

      // 3) Post-traitement léger : calcul hoursDone et ajout promotion
      const processed = results.map((item) => {
        const hoursDone = item.sessions
          .filter((s) => s.status === "done")
          .reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

        return {
          moduleId: item.moduleId.toString(),
          title: item.title || "",
          code: item.code || "",
          coefficient:
            typeof item.coefficient === "number" ? item.coefficient : 1,
          credits: typeof item.credits === "number" ? item.credits : 0,
          promotion: {
            _id: promotionObjectId.toString(),
            name: promotion.name || "",
          },
          hoursPlanned: item.hoursPlanned || 0,
          hoursDone: hoursDone,
          sessions: item.sessions || [],
        };
      });

      // 4) Tri par titre
      processed.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

      return processed;
    } catch (error) {
      console.error("[Schedule Queries] getPromotionProgression error:", error);
      throw error;
    }
  }

  async SetStudentReclamation(scheduleId, studentId) {
    try {
      return await this.model
        .findByIdAndUpdate(
          scheduleId,
          { $addToSet: { studentReclamations: studentId } },
          { new: true }
        )
        .populate("studentReclamations", "matricule");
    } catch (error) {
      throw error;
    }
  }

  async getScheduleOfTodayForStudentDashboard(promotionId) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      return await this.model
        .find({
          promotions: promotionId,
          date: { $gte: startOfDay, $lte: endOfDay },
        })
        .populate("module", "name code")
        .populate("professor", "name firstName email isPermanent phone")
        .select("date startTime endTime room module professor status title ");
    } catch (error) {
      throw error;
    }
  }

  async getProfessorProgressionForDashboard(promotionIds, professorId) {
    try {
      // Return empty if no promotions provided
      if (!promotionIds || promotionIds.length === 0) {
        return [];
      }

      const promotionObjectIds = promotionIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const professorObjectId = new mongoose.Types.ObjectId(professorId);
      const promotionSet = new Set(
        promotionObjectIds.map((id) => id.toString())
      );

      const query = {
        professor: professorObjectId,
        promotions: { $in: promotionObjectIds },
      };

      // 1) Récupérer les séances minimales - seulement ce dont on a besoin
      const schedules = await this.model
        .find(query)
        .select("module promotions duration status")
        .lean();

      if (!schedules.length) return [];

      // 2) Collecter les ids modules et promotions réellement utilisés
      const moduleIdsSet = new Set();
      for (const s of schedules) {
        if (s.module) moduleIdsSet.add(s.module.toString());
      }

      const moduleIds = Array.from(moduleIdsSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // 3) Lookup modules uniquement (pas de promotions)
      const modules = await Module.find({ _id: { $in: moduleIds } })
        .select("title name code coefficient credits hours")
        .lean();

      const modulesMap = new Map(modules.map((m) => [m._id.toString(), m]));

      // 4) Regrouper par (moduleId, promotionId) et calculer hoursDone
      const byKey = new Map();
      for (const s of schedules) {
        const modId = s.module?.toString();
        if (!modId) continue;

        const promos = (s.promotions || [])
          .map((x) => x.toString())
          .filter((x) => promotionSet.has(x));

        const dur = Number(s.duration) || 0;
        const isDone = s.status === "done";

        for (const promoId of promos) {
          const key = `${modId}|${promoId}`;
          let item = byKey.get(key);
          if (!item) {
            const m = modulesMap.get(modId) || {};
            item = {
              moduleId: modId,
              title: m.title || m.name || "",
              code: m.code || "",
              coefficient:
                typeof m.coefficient === "number" ? m.coefficient : 1,
              credits: typeof m.credits === "number" ? m.credits : 0,
              promotionId: promoId,
              hoursPlanned: m.hours || 0,
              hoursDone: 0,
            };
            byKey.set(key, item);
          }

          if (isDone) item.hoursDone += dur;
        }
      }

      // 5) Conversion en tableau et tri
      const result = Array.from(byKey.values()).map((x) => ({
        moduleId: x.moduleId.toString(),
        title: x.title,
        code: x.code,
        coefficient: x.coefficient,
        credits: x.credits,
        promotionId: x.promotionId.toString(),
        hoursPlanned: x.hoursPlanned,
        hoursDone: x.hoursDone,
      }));

      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

      return result;
    } catch (error) {
      console.error(
        "[Schedule Queries] getProfessorProgressionForDashboard error:",
        error
      );
      throw error;
    }
  }
  async getProfessorTotalHoursThisWeek(professorId, promotionIds) {
    try {
      // Return 0 if no promotions provided
      if (!promotionIds || promotionIds.length === 0) {
        return 0;
      }

      const professorObjectId = new mongoose.Types.ObjectId(professorId);
      const promotionObjectIds = promotionIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // Calculate start of week (Monday 00:00:00)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days to Monday

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      // Calculate end of week (Saturday 23:59:59)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 5); // Monday + 5 days = Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      // Use aggregation for optimal performance
      const result = await this.model.aggregate([
        {
          $match: {
            professor: professorObjectId,
            promotions: { $in: promotionObjectIds },
            date: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: "$duration" },
          },
        },
      ]);

      // Return total minutes (or 0 if no sessions found)
      return result[0]?.totalMinutes || 0;
    } catch (error) {
      console.error(
        "[Schedule Queries] getProfessorTotalHoursThisWeek error:",
        error
      );
      throw error;
    }
  }

  async getScheduleOfTodayForProfessor(professorId, promotionIds) {
    try {
      // Return empty if no promotions provided
      if (!promotionIds || promotionIds.length === 0) {
        return [];
      }

      const professorObjectId = new mongoose.Types.ObjectId(professorId);
      const promotionObjectIds = promotionIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return await this.model
        .find({
          professor: professorObjectId,
          promotions: { $in: promotionObjectIds },
          date: { $gte: startOfDay, $lte: endOfDay },
        })
        .populate("module", "name code title")
        .populate("promotions", "name level field")
        .select(
          "date startTime endTime room module promotions status title duration"
        )
        .sort({ startTime: 1 })
        .lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ScheduleQueries();

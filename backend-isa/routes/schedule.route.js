const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { isRestrictedMiddleware, isConnectedMiddleware, isProfessorMiddleware, isStudentMiddleware } = require("../middleware/middleware.global");
const Schedule = require("../models/schedule.model");
const promotionQueries = require("../queries/promotion.queries");
const scheduleQueries = require("../queries/schedule.queries");
const { DateTime } = require("luxon");

const router = require("express").Router();

router.get("/by-range", isConnectedMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const schedules = await scheduleQueries.GetScheduleByRange(
      startDate,
      endDate
    );

    res.status(200).json(schedules);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const {
      level,
      department,
      date,
      startTime,
      endTime,
      professor,
      room,
      duration,
    } = req.body;

    const isProfessorAvailable =
      await scheduleQueries.CheckProfessorDisponibilities(
        professor,
        startTime,
        endTime,
        date
      );

    if (isProfessorAvailable && isProfessorAvailable.length > 0) {
      const occupiedSlots = isProfessorAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");

      return res
        .status(409)
        .send(
          `Le professeur a déjà cours aux créneaux suivants : ${occupiedSlots}`
        );
    }

    const isRoomAvailable = await scheduleQueries.checkRoomDisponibilities(
      room,
      startTime,
      endTime,
      date
    );

    if (isRoomAvailable && isRoomAvailable.length > 0) {
      const occupiedSlots = isRoomAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");

      return res
        .status(409)
        .send(
          `La salle suivante est déjà occupée aux créneaux suivants : ${occupiedSlots}`
        );
    }

    const promotions =
      await promotionQueries.GetClosestActivePromotionsOptimized(
        level,
        department
      );

    let promotionIds = [];

    for (let promotion of promotions) {
      promotionIds.push(promotion._id);
    }

    const isPromotionAvailable =
      await scheduleQueries.checkPromotionsDisponibilities(
        promotionIds,
        startTime,
        endTime,
        date
      );

    if (isPromotionAvailable && isPromotionAvailable.length > 0) {
      const occupiedSlots = isPromotionAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");
      const promotionIdsStr = promotionIds.map((id) => id.toString());

      const filteredPromotions = isPromotionAvailable.flatMap((p) =>
        p.promotions.filter((k) => promotionIdsStr.includes(k._id.toString()))
      );

      console.log(filteredPromotions);

      const promotionNames = filteredPromotions.map((s) => s.name).join(",");

      return res
        .status(409)
        .send(
          `Les promotions : ${promotionNames}  , ont déjà cours aux créneaux suivants : ${occupiedSlots}`
        );
    }

    let data = {
      ...req.body,
      promotions: promotionIds,
      createdBy: req.session._id,
    };

    if (promotionIds.length !== level.length * department.length) {
      return res
        .status(404)
        .send(
          "Certaines promotions sont manquantes pour effectuer l'emploi du temps demandé."
        );
    }

    const modules = await scheduleQueries.getProfProgression(
      promotionIds,
      professor
    );
    if (modules.length !== 0) {
      const allSessions = modules
        .map((m) => m.sessions.filter((s) => s.status !== "missed"))
        .flat();
      const hoursPlanned = modules[0].hoursPlanned;
      const hoursConsumed = allSessions.reduce(
        (acc, session) => acc + session.duration,
        0
      );
      const availableHours = hoursPlanned - hoursConsumed;

      if (availableHours < duration) {
        return res
          .status(404)
          .send(
            `Vous avez planifié ${hoursConsumed} heures sur un total de ${hoursPlanned} heures. Il ne vous reste ${availableHours < 0 ? "plus d'heures" : `plus que ${availableHours} heures`} à planifier pour ce module.`
          );
      }
    }

    const schedule = await scheduleQueries.createSchedule(data);

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).send("Erreur serveur");
    console.log(error);
  }
});

router.patch("/status/:id", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await scheduleQueries.updateScheduleStatusManually(
      id,
      req.session._id
    );

    if (updatedSchedule === null) {
      return res
        .status(404)
        .send("La séance a déjà été approuvée par le système ou n'existe pas");
    }
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la séance
    const schedule = await scheduleQueries.GetScheduleById(id);
    if (!schedule) {
      return res.status(404).send("La séance n'existe pas.");
    }

    // Fuseau horaire de Madagascar
    const TIMEZONE = "Indian/Antananarivo";
    const nowLocal = DateTime.now().setZone(TIMEZONE);

    // Date + heure début
    const scheduleDate = DateTime.fromJSDate(schedule.date).setZone(TIMEZONE);
    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const startDateTime = scheduleDate.set({
      hour: startH,
      minute: startM,
      second: 0,
      millisecond: 0,
    });

    const endDateTime = scheduleDate.set({
      hour: endH,
      minute: endM,
      second: 0,
      millisecond: 0,
    });

    console.log(`[DELETE Schedule] Heure actuelle: ${nowLocal.toISO()}`);
    console.log(`[DELETE Schedule] Début: ${startDateTime.toISO()}`);
    console.log(`[DELETE Schedule] Fin: ${endDateTime.toISO()}`);

    // Vérification : séance déjà passée
    if (endDateTime < nowLocal) {
      return res
        .status(400)
        .send(
          `Impossible de supprimer une séance passée. ` +
          `La séance s'est terminée le ${endDateTime.toFormat("dd/MM/yyyy à HH:mm")}.`
        );
    }

    // Vérification : séance en cours
    if (nowLocal >= startDateTime && nowLocal <= endDateTime) {
      return res
        .status(400)
        .send(
          `Impossible de supprimer une séance en cours. ` +
          `La séance a commencé à ${startDateTime.toFormat("HH:mm")} et se termine à ${endDateTime.toFormat("HH:mm")}.`
        );
    }

    // Vérification : séance dans moins d'une heure
    const timeDifference = startDateTime.diff(nowLocal, "minutes").minutes;
    if (timeDifference <= 60) {
      return res
        .status(400)
        .send(
          `Impossible de supprimer une séance qui va commencer dans moins d'une heure. ` +
          `La séance commence dans ${Math.round(timeDifference)} minutes.`
        );
    }

    // Suppression
    const deletedSchedule = await scheduleQueries.deleteSchedule(id);
    if (!deletedSchedule) {
      return res
        .status(404)
        .send("Erreur lors de la suppression de la séance.");
    }

    res.status(200).json({
      message: "Séance supprimée avec succès.",
      deletedSchedule: {
        id: deletedSchedule._id,
        title: deletedSchedule.title,
        scheduledFor: startDateTime.toFormat("dd/MM/yyyy à HH:mm"),
        deletedAt: nowLocal.toFormat("dd/MM/yyyy à HH:mm"),
      },
    });
  } catch (error) {
    console.error(`[DELETE Schedule] Erreur: ${error.message}`);
    res.status(500).send("Erreur interne du serveur.");
  }
});

router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      level,
      department,
      date,
      startTime,
      endTime,
      professor,
      room,
      duration,
    } = req.body;

    // Récupérer la séance
    const schedule = await scheduleQueries.GetScheduleById(id);
    if (!schedule) {
      return res.status(404).send("La séance n'existe pas.");
    }

    // Fuseau horaire de Madagascar
    const TIMEZONE = "Indian/Antananarivo";
    const nowLocal = DateTime.now().setZone(TIMEZONE);

    // Date + heure début et fin
    const scheduleDate = DateTime.fromJSDate(schedule.date).setZone(TIMEZONE);
    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const startDateTime = scheduleDate.set({
      hour: startH,
      minute: startM,
      second: 0,
      millisecond: 0,
    });

    const endDateTime = scheduleDate.set({
      hour: endH,
      minute: endM,
      second: 0,
      millisecond: 0,
    });

    // Vérification : séance déjà passée
    if (endDateTime < nowLocal) {
      return res
        .status(400)
        .send(
          `Impossible de modifier une séance déjà terminée. ` +
          `La séance s'est terminée le ${endDateTime.toFormat("dd/MM/yyyy à HH:mm")}.`
        );
    }

    // Vérification : séance en cours
    if (nowLocal >= startDateTime && nowLocal <= endDateTime) {
      return res
        .status(400)
        .send(
          `Impossible de modifier une séance en cours. ` +
          `Elle a commencé à ${startDateTime.toFormat("HH:mm")} et se termine à ${endDateTime.toFormat("HH:mm")}.`
        );
    }

    // Vérifier disponibilité du professeur (en excluant la séance actuelle)
    const isProfessorAvailable =
      await scheduleQueries.CheckProfessorDisponibilities(
        professor,
        startTime,
        endTime,
        date,
        id
      );

    if (isProfessorAvailable && isProfessorAvailable.length > 0) {
      const occupiedSlots = isProfessorAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");
      return res
        .status(409)
        .send(
          `Le professeur a déjà cours aux créneaux suivants : ${occupiedSlots}`
        );
    }

    // Vérifier disponibilité de la salle
    const isRoomAvailable = await scheduleQueries.checkRoomDisponibilities(
      room,
      startTime,
      endTime,
      date,
      id
    );

    if (isRoomAvailable && isRoomAvailable.length > 0) {
      const occupiedSlots = isRoomAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");
      return res
        .status(409)
        .send(
          `La salle ${room} est déjà occupée aux créneaux suivants : ${occupiedSlots}`
        );
    }

    // Vérifier promotions
    const promotions =
      await promotionQueries.GetClosestActivePromotionsOptimized(
        level,
        department
      );
    const promotionIds = promotions.map((promotion) => promotion._id);

    const isPromotionAvailable =
      await scheduleQueries.checkPromotionsDisponibilities(
        promotionIds,
        startTime,
        endTime,
        date,
        id
      );

    if (isPromotionAvailable && isPromotionAvailable.length > 0) {
      const occupiedSlots = isPromotionAvailable
        .map(
          (s) =>
            `${s.date.toISOString().split("T")[0]} de ${s.startTime} à ${s.endTime}`
        )
        .join(", ");

      const promotionIdsStr = promotionIds.map((pid) => pid.toString());
      const filteredPromotions = isPromotionAvailable.flatMap((p) =>
        p.promotions.filter((k) => promotionIdsStr.includes(k._id.toString()))
      );

      const promotionNames = filteredPromotions.map((s) => s.name).join(", ");

      return res
        .status(409)
        .send(
          `Les promotions : ${promotionNames}, ont déjà cours aux créneaux suivants : ${occupiedSlots}`
        );
    }

    if (promotionIds.length !== level.length * department.length) {
      return res
        .status(404)
        .send(
          "Certaines promotions sont manquantes pour effectuer l'emploi du temps demandé."
        );
    }

    // Préparer données de mise à jour
    const data = {
      ...req.body,
      promotions: promotionIds,
      modifiedBy: req.session._id,
    };

    const modules = await scheduleQueries.getProfProgression(
      promotionIds,
      professor
    );
    if (modules.length !== 0) {
      const allSessions = modules
        .map((m) => m.sessions.filter((s) => s.status !== "missed"))
        .flat();
      const hoursPlanned = modules[0].hoursPlanned;
      const hoursConsumed = allSessions.reduce(
        (acc, session) => acc + session.duration,
        0
      );
      const availableHours = hoursPlanned - hoursConsumed;

      if (availableHours < duration) {
        return res
          .status(404)
          .send(
            `Vous avez planifié ${hoursConsumed} heures sur un total de ${hoursPlanned} heures. Il ne vous reste ${availableHours < 0 ? "plus d'heures" : `plus que ${availableHours} heures`} à planifier pour ce module.`
          );
      }
    }

    // Mettre à jour la séance
    const updatedSchedule = await scheduleQueries.UpdateScheduleById(id, data);
    if (!updatedSchedule) {
      return res.status(404).send("La séance n'existe pas.");
    }

    res.status(200).json(updatedSchedule);
  } catch (error) {
    console.error(`[PATCH Schedule] Erreur: ${error.message}`);
    res.status(500).send("Erreur interne du serveur.");
  }
});

router.get("/professor/:professorId", isProfessorMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { professorId } = req.params;
    if (!professorId) {
      return res.status(400).send("Le paramètre professorId est requis.");
    }
    const schedules = await scheduleQueries.GetScheduleByRange(
      startDate,
      endDate,
      { professorId }
    );

    res.status(200).json(schedules);
  } catch (error) {
    console.log(error);
  }
});

router.get("/promotion/:promotionId", isStudentMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { promotionId } = req.params;
    if (!promotionId) {
      return res.status(400).send("Le paramètre promotionId est requis.");
    }

    const schedules = await scheduleQueries.GetScheduleByRange(
      startDate,
      endDate,
      { promotionId }
    );

    res.status(200).json(schedules);
  } catch (error) {
    console.log(error);
  }
});

router.patch("/reclamation/:scheduleId", isRestrictedMiddleware, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const studentId = req.session._id;

    const schedule = await scheduleQueries.GetScheduleById(scheduleId);
    if (!schedule) {
      return res.status(404).send("La séance n'existe pas.");
    }

    // Vérifier si la réclamation a déjà été approuvée par le cron
    if (schedule.approvedByCron) {
      return res
        .status(400)
        .send(
          "Une décision a déjà été prise pour cette séance. Vous ne pouvez plus signaler le prof comme absent."
        );
    }

    if (schedule.studentReclamations.includes(studentId)) {
      return res
        .status(400)
        .send(
          "Vous avez déjà signalé ce professeur comme absent pour cette séance."
        );
    }

    if (schedule.status === 'missed') {
      return res
        .status(400)
        .send(
          "Cette séance a déjà été marquée comme manquée par le système."
        );
    }

    // Vérifier que le cours a commencé (pas avant l'heure de début)
    const { DateTime } = require("luxon");
    const scheduleDate = DateTime.fromJSDate(schedule.date).setZone(
      "Africa/Nairobi"
    );
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const scheduleStartTime = scheduleDate.set({
      hour: startHour,
      minute: startMinute,
    });
    const now = DateTime.now().setZone("Africa/Nairobi");

    if (now < scheduleStartTime) {
      return res
        .status(400)
        .send(
          "Vous ne pouvez pas signaler un professeur comme absent avant le début du cours."
        );
    }

    await scheduleQueries.SetStudentReclamation(scheduleId, studentId);
    res.status(200).send("Ok");
  } catch (error) {
    console.error(`[PATCH Schedule] Erreur: ${error.message}`);
    res.status(500).send("Erreur interne du serveur.");
  }
});

module.exports = router;

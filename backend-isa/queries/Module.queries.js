const Module = require("../models/module.model");
const fs = require("fs/promises");
const path = require("path");
class ModuleQueries {
  constructor() {
    this.model = Module;
  }

  async getModuleByCode(code) {
    try {
      return await this.model.findOne({ code: code.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  async getModuleById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async GetModulesByTeachingUnit(teachingUnit) {
    try {
      return await this.model
        .find({ teachingUnit })
        .populate("teacher", "-password");
    } catch (error) {
      throw error;
    }
  }

  async getModulesNumberByTeachingUnit(teachingUnit, session = null) {
    try {
      if (session) {
        return await this.model.countDocuments({ teachingUnit }).session(session);
      }
      return await this.model.countDocuments({ teachingUnit });
    }
    catch (error) {
      throw error;
    }
  }

  async GetModulesByTeachingUnitWithoutPopulateAndFiles(teachingUnit) {
    try {
      return await this.model.find({ teachingUnit }).select("-files");
    } catch (error) {
      throw error;
    }
  }

  async CreateModule(data, session = null) {
    try {
      const newModule = new this.model(data);
      if (session) {
        return await newModule.save({ session });
      } else {
        return await newModule.save();
      }
    } catch (error) {
      throw error;
    }
  }

  async DeleteFile(filePath, id, session = null) {
    try {
      // 1️⃣ Empêcher la remontée de répertoires (../)
      const sanitizedPath = path
        .normalize(filePath)
        .replace(/^(\.\.(\/|\\|$))+/, "");

      // 2️⃣ Construire le chemin réel dans le dossier "private"
      const baseDir = path.join(__dirname, "..", "private");
      const realPath = path.join(baseDir, sanitizedPath);

      // 3️⃣ Vérifier que le fichier se trouve bien dans le dossier "private"
      if (!realPath.startsWith(baseDir)) {
        throw new Error("Chemin de fichier non autorisé !");
      }

      // 4️⃣ Vérifier que le fichier existe avant suppression
      try {
        await fs.access(realPath); // si le fichier n'existe pas, ça va lancer ENOENT
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn("Fichier non trouvé :", realPath);
          // On peut décider de faire l'update même si le fichier est déjà supprimé
          await this.model.updateOne(
            { _id: id },
            { $pull: { files: filePath } }
          );
          return; // sortir de la fonction
        } else {
          throw err;
        }
      }

      // 5️⃣ Supprimer le fichier
      await fs.unlink(realPath);
      console.log(`Fichier supprimé : ${realPath}`);

      // 6️⃣ Mettre à jour la DB
      const updatedDoc = await this.model.findByIdAndUpdate(
        id,
        { $pull: { files: filePath } },
        { new: true, session } // retourne le document mis à jour

      );

      return updatedDoc;
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      throw error; // relancer pour traitement extérieur
    }
  }

  async DeleteModule(id, session = null) {
    try {
      let deletedModule;

      if (session) {
        deletedModule = await this.model.findByIdAndDelete(id, { session });
      } else {
        deletedModule = await this.model.findByIdAndDelete(id);
      }

      if (
        deletedModule &&
        deletedModule.files &&
        deletedModule.files.length > 0
      ) {
        await Promise.all(
          deletedModule.files.map((file) => {
            this.DeleteFile(file, deletedModule._id);
          })
        );
      }
      return deletedModule;
    } catch (error) {
      throw error;
    }
  }

  async UpdateModule(id, data, session = null) {
    try {
      let updatedModule;
      if (session) {
        updatedModule = await this.model.findByIdAndUpdate(id, data, {
          new: true,
          session,
        }).populate("teacher", "-password");
      } else {
        updatedModule = await this.model.findByIdAndUpdate(id, data, {
          new: true,
        }).populate("teacher", "-password");
      }

      return updatedModule;
    } catch (error) {
      throw error;
    }
  }

  async GetModulesByProfessor(professorId) {
    try {
      return await this.model.find({ teacher: professorId });
    } catch (error) {
      throw error;
    }
  }

  async GetAllModules() {
    try {
      return await this.model
        .find()
        .select("-files")
        .populate("teachingUnit", "name code level field semester") // Limiter les champs du populate
        .lean(); // Retourne des objets JS simples (plus rapide)
    } catch (error) {
      throw error;
    }
  }

  async getModuleByIdWiTeachingUnit(moduleId) {
    try {
      return await this.model
        .findById(moduleId)
        .populate("teachingUnit", "level field semester");
    } catch (error) {
      throw error;
    }
  }

  async getModuleByTeachingUnitWithoutPopulate(teachingUnitId) {
    try {
      return await this.model.find({ teachingUnit: teachingUnitId }).lean();
    } catch (error) {
      throw error;
    }
  }

  async getNumberOfModulesForProfessorDashboard(professorId) {
    try {
      return await this.model.countDocuments({ teacher: professorId });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ModuleQueries();

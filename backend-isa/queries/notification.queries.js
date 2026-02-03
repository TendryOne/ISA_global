const Notification = require("../models/notification.model");
const NotificationSeen = require("../models/notificationSeen");

class NotificationQueries {
  constructor() {
    this.model = Notification;
  }

  async createNotification(data) {
    try {
      const notification = new this.model(data);
      return await notification.save();
    } catch (error) {
      throw error;
    }
  }

  async getNotificationsByUserId(
    userId,
    role,
    promotionIds = [],
    page = 1,
    limitPerPage = 10
  ) {
    try {
      const perPage = limitPerPage || 10;
      const skip = (page - 1) * perPage;

      // Construction du filtre selon le rôle
      const typeFilters = [];

      // Tous les rôles ont accès aux notifications individuelles et globales
      typeFilters.push({ type: "individual", user: userId });
      typeFilters.push({ type: "global" });

      // Filtres spécifiques par rôle
      switch (role) {
        case "admin":
          typeFilters.push({ type: "admin" });
          break;

        case "student":
          typeFilters.push({ type: "student" });
          // Notifications de promotion pour toutes les promotions de l'étudiant
          if (promotionIds && promotionIds.length > 0) {
            typeFilters.push({
              type: "promotion",
              promotion: { $in: promotionIds },
            });
          }
          break;

        case "professor":
          typeFilters.push({ type: "professor" });
          break;

        case "superAdmin":
          typeFilters.push({ type: "superAdmin" });
          typeFilters.push({ type: "admin" });
          break;

        default:
          // Pour les rôles non reconnus, seulement individual et global
          break;
      }

      // Requête avec $or pour combiner tous les filtres
      const [notifications, total, notificationSeen] = await Promise.all([
        this.model
          .find({ $or: typeFilters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),

        this.model.countDocuments({ $or: typeFilters }),

        // Récupérer le lastSeenAt de l'utilisateur
        NotificationSeen.findOne({ user: userId }).lean(),
      ]);

      // Calculer le nombre de notifications non vues
      const lastSeenAt = notificationSeen?.lastSeenAt || new Date(0); // Si pas de record, toutes sont non vues

      const unseenCount = await this.model.countDocuments({
        $or: typeFilters,
        createdAt: { $gt: lastSeenAt },
      });

      return {
        notifications,
        total,
        unseenCount,
        lastSeenAt,
        page: parseInt(page),
        totalPages: Math.ceil(total / perPage),
        perPage: parseInt(perPage),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NotificationQueries();

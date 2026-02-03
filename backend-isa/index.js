const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 4000;
const path = require("path");
const session = require("express-session");
const mongostore = require("connect-mongo");
const helmet = require("helmet");
const crypto = require("crypto");
require("dotenv").config();
const routes = require("./routes/index.routes");
const cors = require("cors");
const { StartPromotionCron } = require("./script/promotion-cron");
const { StartFeesReminderCron } = require("./script/checkFeesAndSendReminder");
const { StartScheduleCron } = require("./script/cronTocheckSchedule");
const initSettings = require("./function/initSettings");
const {
  StartResultAndInscriptionScheduler,
} = require("./script/resultAndInscription");
const { seedAdmin } = require("./admin");

require("./database");
(async () => {
  await initSettings();
  await seedAdmin();
})();

StartPromotionCron();
StartResultAndInscriptionScheduler();
StartScheduleCron();
StartFeesReminderCron();

exports.app = app;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:3000,https://edu.isa-ambato.mg,https://isa-ambato.mg")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permet les clients non-navigateurs (pas d'Origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

const sessionMiddleware = session({
  secret: process.env.SECRET_SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  name: `ISA_auth`,
  cookie: {
    sameSite: "strict",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  },
  store: mongostore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 * 7,
  }),
});

app.use(sessionMiddleware);

app.use(routes);

// Dans votre error handler (app.js ou middleware)

const server = app.listen(PORT, () => {
  console.log(`listen on PORT : http://localhost:${PORT}`);
});

module.exports = {
  sessionMiddleware,
  server,
};

require("./socket");

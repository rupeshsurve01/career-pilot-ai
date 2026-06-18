const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")

const app = express();


app.use(express.json()); // allows data reading from a request
app.use(cookieParser());
const corsOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CareerPilot AI Backend Running"
    });
});

// require all thr routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")

// using all the routes here
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;

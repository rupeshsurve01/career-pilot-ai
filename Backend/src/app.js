const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")

const app = express();


app.use(express.json()); 
app.use(cookieParser());
const corsOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (no Origin header)
      if (!origin) return cb(null, true);

      // reflect allowed origins
      if (corsOrigins.includes(origin)) return cb(null, true);

      // deny explicitly (prevents browser treating it as a generic network error)
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("/", cors({ origin: true, credentials: true }));



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

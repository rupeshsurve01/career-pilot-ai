const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controller/interview.controller")
const upload = require('../middleware/file.middleware')

const interviewRouter = express.Router();

interviewRouter.post("/", authMiddleware.authUser, upload.single("single"), interviewController.generateInterviewReportController);

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewController)

module.exports = interviewRouter;

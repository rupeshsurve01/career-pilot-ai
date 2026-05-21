const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controller/interview.controller")
const upload = require('../middleware/file.middleware')

const interviewRouter = express.Router();

interviewRouter.post("/", authMiddleware.authUser, upload.single("single"), interviewController.generateInterViewReportController);

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)



module.exports = interviewRouter

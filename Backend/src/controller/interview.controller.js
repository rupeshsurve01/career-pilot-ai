const { PDFParse } = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
  try {
    const { resumeDescription, jobDescription } = req.body;
    let resumeText = "";

    if (req.file?.buffer) {
      const parser = new PDFParse({ data: req.file.buffer });
      const resumeContent = await parser.getText();
      resumeText = resumeContent.text;
      await parser.destroy();
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription: resumeDescription,
      jobDescription,
    });

    const title =
      interViewReportByAi?.title?.trim() ||
      jobDescription?.split("\n")[0]?.trim() ||
      "Interview Report";

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: resumeDescription,
      jobDescription,
      ...interViewReportByAi,
      title,
    });

    res.status(201).json({
      message: "Interview Report Generated Sucessfully",
      interviewReport,
    });
  } catch (error) {
    console.error(error);

    const status = error?.status || error?.error?.code;

    if (status === 503) {
      return res.status(503).json({
        message: "AI service is busy right now. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      message: "Failed to generate interview report.",
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview Report Not Found.",
    });
  }

  return res.status(200).json(interviewReport);
}

async function getAllInterviewController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -_v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  return res.status(200).json(interviewReports);
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewController,
};

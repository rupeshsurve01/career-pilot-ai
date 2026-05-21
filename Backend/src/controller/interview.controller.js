const { PDFParse } = require("pdf-parse");
const interviewReportModel = require("../models/interviewReport.model");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")

async function generateInterViewReportController(req, res) {
  try {
    const { resumeDescription, selfDescription, jobDescription } = req.body;
    let resumeText = "";

    if (req.file?.buffer) {
      const parser = new PDFParse({ data: req.file.buffer });
      const resumeContent = await parser.getText();
      resumeText = resumeContent.text;
      await parser.destroy();
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription || resumeDescription || "",
      jobDescription,
    });

    const title =
      interViewReportByAi?.title?.trim() ||
      jobDescription?.split("\n")[0]?.trim() ||
      "Interview Report";

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription || resumeDescription || "",
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


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewController, generateResumePdfController }

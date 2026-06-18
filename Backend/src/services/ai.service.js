const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

// puppeteer is ESM in recent versions; using require() breaks on Railway/Node with ERR_REQUIRE_ESM.
// Lazy-load it inside generatePdf() instead of at module init.


const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.0-flash"];
const AI_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];
const MAX_RETRIES_PER_MODEL = 2;
const BASE_RETRY_DELAY_MS = 1500;
let aiJobQueue = Promise.resolve();

/* -------------------------------------------------------------------------- */
/*                               RESUME SCHEMA                                */
/* -------------------------------------------------------------------------- */

const resumeSchema = z.object({
  fullName: z.string(),

  role: z.string(),

  email: z.string().optional().default(""),

  phone: z.string().optional().default(""),

  location: z.string().optional().default(""),

  linkedin: z.string().optional().default(""),

  github: z.string().optional().default(""),

  portfolio: z.string().optional().default(""),

  summary: z.string(),

  skillCategories: z
    .array(
      z.object({
        category: z.string(),
        skills: z.array(z.string()),
      }),
    )
    .min(2)
    .max(6),

  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        duration: z.string(),
        details: z.string(),
      }),
    )
    .min(1)
    .max(2),

  certifications: z.array(z.string()).default([]),

  achievements: z.array(z.string()).default([]),

  toolsAndPlatforms: z.array(z.string()).default([]),

  projects: z
    .array(
      z.object({
        name: z.string(),
        stack: z.string(),
        bullets: z.array(z.string()).min(2).max(4),
      }),
    )
    .min(1)
    .max(3),

  experience: z
    .array(
      z.object({
        role: z.string(),
        company: z.string(),
        duration: z.string(),
        bullets: z.array(z.string()).min(2).max(5),
      }),
    )
    .default([]),
});

const outputSchema = resumeSchema.extend({
  analysis: z.object({
    matchScore: z.number().min(0).max(100),
    missingKeywords: z.array(z.string()),
    improvementSuggestions: z.array(z.string()),
  }),
});

const interviewReportSchema = z.object({
  title: z.string().min(1),
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number().int().min(1),
      focus: z.string().min(1),
      tasks: z.array(z.string().min(1)).min(1),
    }),
  ),
});

function extractResponseText(response) {
  if (typeof response?.text === "string") {
    return response.text;
  }

  if (typeof response?.text === "function") {
    return response.text();
  }

  if (typeof response?.response?.text === "function") {
    return response.response.text();
  }

  return "";
}

function isServiceBusyError(error) {
  const status = error?.status || error?.error?.status || error?.error?.code;

  return status === 503 || String(error?.message || "").includes('"code":503');
}

function isRateLimitError(error) {
  // Gemini quota/rate limit returns 429 (RESOURCE_EXHAUSTED)
  const status = error?.status || error?.error?.status || error?.error?.code;
  return status === 429 || String(error?.message || "").includes("RESOURCE_EXHAUSTED");
}


function isMissingModelError(error) {
  const status = error?.status || error?.error?.status || error?.error?.code;

  return status === 404 || String(error?.message || "").includes("not found");
}

function isAuthConfigurationError(error) {
  const status = error?.status || error?.error?.status || error?.error?.code;
  const message = String(error?.message || "");

  return status === 401 || message.includes("API key should be set");
}

function createServiceError(message, status, cause) {
  const error = new Error(message);
  error.status = status;

  if (cause) {
    error.cause = cause;
  }

  return error;
}

function getRetryDelay(attempt) {
  return BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
}

function enqueueAiJob(task) {
  const queuedTask = aiJobQueue.catch(() => {}).then(task);
  aiJobQueue = queuedTask.catch(() => {});

  return queuedTask;
}

async function generateStructuredJson({ prompt, schema }) {
  return enqueueAiJob(async () => {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw createServiceError(
        "AI service is not configured right now. Please add the Gemini API key.",
        503,
      );
    }

    let lastError = null;

    for (const model of AI_MODELS) {
      for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const rawText = extractResponseText(response)
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          if (!rawText) {
            throw new Error("AI returned empty response.");
          }

          const parsed = JSON.parse(rawText);
          const validated = schema.safeParse(parsed);

          if (!validated.success) {
            console.log(JSON.stringify(validated.error.format(), null, 2));
            throw new Error("AI response did not match required format.");
          }

          return validated.data;
        } catch (error) {
          lastError = error;

          if (isAuthConfigurationError(error)) {
            throw createServiceError(
              "AI service is not configured right now. Please try again later.",
              503,
              error,
            );
          }

          if (isMissingModelError(error)) {
            break;
          }

          if (isRateLimitError(error) && attempt < MAX_RETRIES_PER_MODEL) {
            // quota/rate limit: treat as retryable
            await new Promise((resolve) =>
              setTimeout(resolve, getRetryDelay(attempt)),
            );
            continue;
          }

          if (isServiceBusyError(error) && attempt < MAX_RETRIES_PER_MODEL) {
            await new Promise((resolve) =>
              setTimeout(resolve, getRetryDelay(attempt)),
            );
            continue;
          }


          if (error instanceof SyntaxError && attempt < MAX_RETRIES_PER_MODEL) {
            await new Promise((resolve) =>
              setTimeout(resolve, getRetryDelay(attempt)),
            );
            continue;
          }

          break;
        }
      }
    }

    if (isRateLimitError(lastError)) {
      throw createServiceError(
        "AI quota/rate limit exceeded. Please try again shortly.",
        503,
        lastError,
      );
    }

    if (isServiceBusyError(lastError)) {
      throw createServiceError(
        "AI service is busy right now. Please try again in a moment.",
        503,
        lastError,
      );
    }

    if (isMissingModelError(lastError)) {
      throw createServiceError(
        "AI model is temporarily unavailable. Please try again later.",
        503,
        lastError,
      );
    }


    throw lastError || createServiceError("AI generation failed.", 500);
  });
}

/* -------------------------------------------------------------------------- */
/*                               HTML TEMPLATE                                */
/* -------------------------------------------------------------------------- */

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResumeHtml(data) {
  const contactItems = [];
  
  const icons = {
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.7 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    github: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    loc: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
  };

  if (data.email) contactItems.push(`<a href="mailto:${data.email}">${icons.email} ${escapeHtml(data.email)}</a>`);
  if (data.phone) contactItems.push(`<span>${icons.phone} ${escapeHtml(data.phone)}</span>`);
  if (data.location) contactItems.push(`<span>${icons.loc} ${escapeHtml(data.location)}</span>`);
  if (data.linkedin) contactItems.push(`<a href="${data.linkedin}">${icons.linkedin} LinkedIn</a>`);
  if (data.github) contactItems.push(`<a href="${data.github}">${icons.github} GitHub</a>`);

  const contactLine = contactItems.join("");
  const hasSummary = Boolean(data.summary?.trim());
  const hasSkills = Array.isArray(data.skillCategories) && data.skillCategories.length > 0;
  const hasProjects = Array.isArray(data.projects) && data.projects.length > 0;
  const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
  const hasEducation = Array.isArray(data.education) && data.education.length > 0;
  const hasCertifications =
    Array.isArray(data.certifications) && data.certifications.length > 0;
  const hasAchievements =
    Array.isArray(data.achievements) && data.achievements.length > 0;
  const hasTools =
    Array.isArray(data.toolsAndPlatforms) && data.toolsAndPlatforms.length > 0;
  const hasSidebar = hasEducation || hasCertifications || hasAchievements || hasTools;

  const skillsHtml = (data.skillCategories || [])
    .map(
      (item) => `
      <div class="skill-card">
        <div class="skill-category">${escapeHtml(item.category)}</div>
        <div class="skill-list">
          ${item.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>
    `,
    )
    .join("");

  const projectsHtml = (data.projects || [])
    .map(
      (project) => `
      <div class="card">
        <div class="top">
          <div>
            <h3>${escapeHtml(project.name)}</h3>
            <span>${escapeHtml(project.stack)}</span>
          </div>
        </div>

        <ul>
          ${(project.bullets || [])
            .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
            .join("")}
        </ul>
      </div>
    `,
    )
    .join("");

  const experienceHtml = (data.experience || [])
    .map(
      (exp) => `
      <div class="card">
        <div class="top">
          <div>
            <h3>${escapeHtml(exp.role)}</h3>
            <span>${escapeHtml(exp.company)}</span>
          </div>

          <div class="date">
            ${escapeHtml(exp.duration)}
          </div>
        </div>

        <ul>
          ${(exp.bullets || [])
            .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
            .join("")}
        </ul>
      </div>
    `,
    )
    .join("");

  const educationHtml = (data.education || [])
    .map(
      (edu) => `
      <div class="card">
        <div class="top">
          <div>
            <h3>${escapeHtml(edu.degree)}</h3>
            <span>${escapeHtml(edu.institution)}</span>
          </div>

          <div class="date">
            ${escapeHtml(edu.duration)}
          </div>
        </div>

        <p>${escapeHtml(edu.details)}</p>
      </div>
    `,
    )
    .join("");
  return `
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
 :root {
  --primary: #0f172a;
  --accent: #2563eb;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border: #cbd5e1;
  --bg-soft: #f8fafc;
 }
 * { margin:0; padding:0; box-sizing:border-box; }
 body {
  font-family: 'Inter', sans-serif;
  background:#f3f4f6;
  color: var(--text-main);
  line-height: 1.4;
 }
 .page {
  width:210mm;
  min-height:297mm;
  margin:auto;
  background:white;
  padding: 50px;
 }
 .header {
  text-align:center;
  padding-bottom:20px;
  margin-bottom:20px;
  border-bottom: 1px solid var(--border);
 }
 .header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--primary);
  letter-spacing: -0.5px;
 }
 .role {
  font-size:14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom:8px;
  text-transform: uppercase;
  letter-spacing: 1px;
 }
 .contact {
  font-size:10px;
  color: var(--text-muted);
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
 }
 .contact a, .contact span { 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  text-decoration: none; 
  color: inherit; 
 }
 .section { margin-bottom: 20px; }
 .section-title {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1.5px solid var(--primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-main);
 }
 .summary { font-size: 11.5px; text-align: justify; color: var(--text-muted); }
 .skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
 }
 .skill-card {
  background: var(--bg-soft);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
 }
 .skill-category {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 6px;
  text-transform: uppercase;
 }
 .skill-list { display: flex; flex-wrap: wrap; gap: 4px; }
 .skill-tag {
  font-size: 10px;
  background: white;
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-main);
 }
 .card { margin-bottom: 14px; }
 .top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
 }
 .top h3 { font-size: 12.5px; font-weight: 700; color: var(--primary); }
 .top span { font-size: 11px; font-weight: 500; color: var(--accent); }
 .date { font-size: 10px; font-weight: 600; color: var(--text-muted); }
 ul { list-style-type: none; padding-left: 12px; margin-top: 4px; }
 li { 
  font-size: 10.5px; 
  margin-bottom: 3px; 
  color: var(--text-muted);
  position: relative;
 }
 li::before {
  content: "•";
  color: var(--accent);
  position: absolute;
  left: -12px;
  font-weight: bold;
 }
 .two-column {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
 }
 .single-column {
  display: block;
 }
 .stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
 }
 .stack-list li {
  list-style: none;
  margin: 0;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: white;
  color: var(--text-main);
  font-size: 10px;
 }
 .stack-list li::before {
  content: none;
 }
</style>

</head>

<body>

<div class="page">

  <div class="header">
    <h1>${escapeHtml(data.fullName)}</h1>

    <div class="role">
      ${escapeHtml(data.role)}
    </div>

    <div class="contact">
      ${contactLine}
    </div>
  </div>

  ${hasSummary ? `
  <div class="section">
    <div class="section-title">
      Professional Summary
    </div>

    <div class="summary">
      ${escapeHtml(data.summary)}
    </div>
  </div>` : ""}

  ${hasSkills ? `
  <div class="section">
    <div class="section-title">
      Skills
    </div>

    <div class="skills-grid">
      ${skillsHtml}
    </div>
  </div>` : ""}

  <div class="${hasSidebar ? "two-column" : "single-column"}">

    <div>

      ${hasProjects ? `
      <div class="section">
        <div class="section-title">
          Projects
        </div>

        ${projectsHtml}
      </div>` : ""}

      ${hasExperience ? `
      <div class="section">
        <div class="section-title">
          Experience
        </div>

        ${experienceHtml}
      </div>` : ""}

    </div>

    ${hasSidebar ? `
    <div>

      ${hasEducation ? `
      <div class="section">
        <div class="section-title">
          Education
        </div>

        ${educationHtml}
      </div>` : ""}

      ${hasCertifications ? `
      <div class="section">
        <div class="section-title">
          Certifications
        </div>

        <ul class="small-list">
          ${(data.certifications || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>` : ""}

      ${hasAchievements ? `
      <div class="section">
        <div class="section-title">
          Achievements
        </div>

        <ul class="small-list">
          ${(data.achievements || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>` : ""}

      ${hasTools ? `
      <div class="section">
        <div class="section-title">
          Tools & Platforms
        </div>

        <ul class="stack-list">
          ${(data.toolsAndPlatforms || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>` : ""}

    </div>
    ` : ""}

  </div>

</div>

</body>

</html>
`;
}

/* -------------------------------------------------------------------------- */
/*                              PDF GENERATION                                */
/* -------------------------------------------------------------------------- */

async function generatePdf(html) {
  // Lazy-load so app startup doesn't fail if puppeteer can't be required at module init.
  const puppeteerModule = await import("puppeteer");
  const puppeteer = puppeteerModule.default || puppeteerModule;

  const browser = await puppeteer.launch({

    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdf = Buffer.from(
    await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
    }),
  );

  await browser.close();

  return pdf;
}

/* -------------------------------------------------------------------------- */
/*                       MAIN INTERVIEW REPORT FUNCTION                       */
/* -------------------------------------------------------------------------- */

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Create a personalized interview preparation report for the candidate below.

Return ONLY valid JSON.
No markdown.
No explanations.

Required JSON structure:

{
  "title": "",
  "matchScore": 0,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [""]
    }
  ]
}

Rules:
- Create a short role-based title.
- Set matchScore between 0 and 100.
- Provide 5 technicalQuestions tailored to the job description and candidate profile.
- Provide 4 behavioralQuestions tailored to the role.
- Provide 3 to 6 skillGaps with severity as only low, medium, or high.
- Provide a 7 day preparationPlan with concrete tasks.
- Use the resume as the source of truth when available.
- If resume details are limited, use the self description to personalize the answers.
- Keep answers practical and interview-ready.

Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}
`;

  return generateStructuredJson({
    prompt,
    schema: interviewReportSchema,
  });
}

/* -------------------------------------------------------------------------- */
/*                           MAIN RESUME FUNCTION                             */
/* -------------------------------------------------------------------------- */

async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Create a modern ATS-friendly professional resume.

Return ONLY valid JSON.
No markdown.
No explanations.

Required JSON structure:

{
  "fullName": "",
  "role": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "",
  "skillCategories": [
    {
      "category": "",
      "skills": []
    }
  ],
  "analysis": {
    "matchScore": 0,
    "missingKeywords": [],
    "improvementSuggestions": []
  },
  "education": [
    {
      "degree": "",
      "institution": "",
      "duration": "",
      "details": ""
    }
  ],
  "certifications": [],
  "achievements": [],
  "toolsAndPlatforms": [],
  "projects": [
    {
      "name": "",
      "stack": "",
      "bullets": []
    }
  ],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "bullets": []
    }
  ]
}

Rules:
- Use the provided 'Resume' as the absolute source of truth for work history and education.
- Rewrite the content to align with the 'Job Description' while staying factually accurate.
- Incorporate the 'Self Description' to personalize the professional summary.
- Keep bullet points short.
- Provide STRICTLY between 2 and 6 skillCategories. Do not exceed 6.
- Fit within one page.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const validated = await generateStructuredJson({
    prompt,
    schema: outputSchema,
  });

  const html = renderResumeHtml(validated);

  const pdf = await generatePdf(html);

  return pdf;
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};

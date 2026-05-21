const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

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
  if (data.email) contactItems.push(data.email);
  if (data.phone) contactItems.push(data.phone);
  if (data.location) contactItems.push(data.location);
  if (data.linkedin) contactItems.push("LinkedIn");
  if (data.github) contactItems.push("GitHub");
  if (data.portfolio) contactItems.push("Portfolio");

  const contactLine = contactItems.join(" | ");

  const skillsHtml = data.skillCategories
    .map(
      (item) => `
      <div class="skill-card">
        <h4>${escapeHtml(item.category)}</h4>
        <p>${item.skills.map(escapeHtml).join(", ")}</p>
      </div>
    `,
    )
    .join("");

  const projectsHtml = data.projects
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

  const experienceHtml =
    data.experience.length > 0
      ? data.experience
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
          .join("")
      : `<p>No formal experience available.</p>`;

  const educationHtml = data.education
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
<meta charset="UTF-8" />

<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background:#f3f4f6;
  color:#111827;
  line-height: 1.5;
}

.page{
  width:210mm;
  min-height:297mm;
  margin:auto;
  background:white;
  padding:30px;
}

.header{
  text-align:center;
  border-bottom:2px solid #111827;
  padding-bottom:15px;
  margin-bottom:20px;
}

.header h1{
  font-size:34px;
  margin-bottom:8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.role{
  font-size:16px;
  font-weight: 600;
  color:#374151;
  margin-bottom:8px;
  text-transform: uppercase;
}

.contact{
  font-size:12px;
  color:#4b5563;
}

.section{
  margin-bottom:20px;
}

.section-title{
  font-size:16px;
  font-weight: bold;
  margin-bottom:10px;
  padding-bottom:4px;
  border-bottom:1px solid #111827;
  text-transform:uppercase;
  letter-spacing: 0.5px;
}

.summary{
  font-size:12px;
  text-align: justify;
}

.skills-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.skill-card{
  background:#f9fafb;
  padding:10px;
  border-radius: 4px;
}

.skill-card h4{
  font-size: 13px;
  margin-bottom:4px;
  color: #111827;
}

.skill-card p{
  font-size:12px;
  color: #4b5563;
}

.card{
  margin-bottom:12px;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items: baseline;
  margin-bottom:4px;
}

.top h3{
  font-size:14px;
  font-weight: bold;
}

.top span{
  font-size:12px;
  font-weight: 500;
  color:#4b5563;
  margin-left: 5px;
}

.date{
  font-size:11px;
  font-weight: 600;
  color:#6b7280;
  white-space: nowrap;
}

ul{
  padding-left:16px;
}

li{
  font-size:12px;
  margin-bottom:2px;
}

.two-column{
  display:grid;
  grid-template-columns: 1.6fr 1fr;
  gap:25px;
}

.small-list li{
  margin-bottom:4px;
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
      ${escapeHtml(contactLine)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      Professional Summary
    </div>

    <div class="summary">
      ${escapeHtml(data.summary)}
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      Skills
    </div>

    <div class="skills-grid">
      ${skillsHtml}
    </div>
  </div>

  <div class="two-column">

    <div>

      <div class="section">
        <div class="section-title">
          Projects
        </div>

        ${projectsHtml}
      </div>

      <div class="section">
        <div class="section-title">
          Experience
        </div>

        ${experienceHtml}
      </div>

    </div>

    <div>

      <div class="section">
        <div class="section-title">
          Education
        </div>

        ${educationHtml}
      </div>

      <div class="section">
        <div class="section-title">
          Certifications
        </div>

        <ul class="small-list">
          ${(data.certifications || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">
          Achievements
        </div>

        <ul class="small-list">
          ${(data.achievements || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">
          Tools & Platforms
        </div>

        <ul class="small-list">
          ${(data.toolsAndPlatforms || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>

    </div>

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
- Make it ATS friendly.
- Make it realistic.
- Keep bullet points short.
- Prioritize MERN stack skills.
- Provide STRICTLY between 2 and 6 skillCategories. Do not exceed 6.
- Fit within one page.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
  ];

  let response = null;

  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Trying ${modelName} | Attempt ${attempt}`,
        );

        response = await ai.models.generateContent({
          model: modelName,

          contents: prompt,

          config: {
            responseMimeType: "application/json",
          },
        });

        break;
      } catch (error) {
        const status =
          error?.status || error?.error?.status;

        const is503 =
          status === 503 ||
          error?.message?.includes('"code":503');

        console.log(error.message);

        if (!is503 || attempt === 3) {
          continue;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 2000),
        );
      }
    }

    if (response) break;
  }

  if (!response) {
    throw new Error(
      "All Gemini models are currently unavailable.",
    );
  }

  let rawText =
    typeof response.text === "string"
      ? response.text
      : response.response?.text?.();

  if (!rawText) {
    console.log(response);

    throw new Error(
      "AI returned empty response.",
    );
  }

  rawText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.log(rawText);

    throw new Error(
      "Invalid JSON returned by AI",
    );
  }

  const validated =
    resumeSchema.safeParse(parsed);

  if (!validated.success) {
    console.log(
      JSON.stringify(
        validated.error.format(),
        null,
        2,
      ),
    );

    throw new Error(
      "AI response did not match required format",
    );
  }

  const html = renderResumeHtml(
    validated.data,
  );

  const pdf = await generatePdf(html);

  return pdf;
}

module.exports = {
  generateResumePdf,
};
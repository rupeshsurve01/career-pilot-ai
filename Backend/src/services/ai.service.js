const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function invokeGeminiAi() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello Gemini! Explain what an interview is.",
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

module.exports = invokeGeminiAi;
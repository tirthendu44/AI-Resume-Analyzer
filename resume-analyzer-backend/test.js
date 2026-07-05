require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

(async () => {
  const models = await ai.models.list();
  console.log(models);
})();

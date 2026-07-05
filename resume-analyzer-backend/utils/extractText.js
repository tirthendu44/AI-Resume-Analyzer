const pdfParse = require("pdf-parse").default || require("pdf-parse");
console.log("pdfParse type:", typeof pdfParse);
const mammoth = require("mammoth");

const fs = require("fs");
const path = require("path");


async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }

  if (ext === ".docx" || ext === ".doc") {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}

module.exports = extractText;

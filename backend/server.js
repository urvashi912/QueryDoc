// Import necessary modules
const dotenv = require('dotenv');
dotenv.config()
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const pdf = require("pdf-parse");
const path = require('path');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage } = require("@langchain/core/messages");



// Create an express application
const app = express();
const PORT = process.env.PORT || 3001
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

// Set up CORS middleware
app.use(
  cors()
);

app.use(express.json()); // Add this line to parse JSON requests

const uploadDirectory = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Function to extract text from a PDF file
async function extractTextFromPDF(filePath) {
  const fullFilePath = path.join(uploadDirectory, filePath);
  console.log("Full File Path:", fullFilePath);
  const dataBuffer = await fs.promises.readFile(fullFilePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

// Function to ask a question based on the PDF content
async function askQuestion(context, question) {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    maxOutputTokens: 2048,
    apiKey: GOOGLE_API_KEY, // Replace "YOUR_API_KEY" with your actual API key
  });

  const response = await model.invoke([
    new HumanMessage(`Context: ${context}\nQuestion: ${question}`),
  ]);
  return response.content;
}

// Route to handle file upload
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const extractedText = await extractTextFromPDF(filePath);
    res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("Error reading PDF file:", error);
    res.status(500).json({ success: false, error: "Error reading PDF file" });
  }
});

// Route to ask a question
app.post("/ask", async (req, res) => {
  const { text, question } = req.body;
  try {
    const answer = await askQuestion(text, question);
    res.json({ success: true, answer: answer });
  } catch (error) {
    console.error("Error answering question:", error);
    res.status(500).json({ success: false, error: "Error answering question" });
  }
});

app.get('/', (req, res) => {
  res.json("heloooo")
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

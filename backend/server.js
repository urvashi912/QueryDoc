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
const PORT = process.env.PORT || 3001;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Set up CORS middleware
app.use(cors());

app.use(express.json()); // Add this line to parse JSON requests

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./tmp/";
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Function to extract text from a PDF file


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
    const filePath = path.join(__dirname, "tmp", req.file.filename); // Construct the file path dynamically
    const extractedText = await extractTextFromPDF(filePath);
    res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("Error reading PDF file:", error);
    res.status(500).json({ success: false, error: "Error reading PDF file" });
  }
});

async function extractTextFromPDF(filePath) {
  try {
    // Ensure filePath is constructed properly and matches where Multer is storing the uploaded file
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

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
  res.json("heloooouuuuuuu")
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

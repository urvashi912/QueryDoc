import React, { useState } from 'react';
import axios from 'axios';
import './mainPage.css'; // Import your CSS file

const MainPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const uploadResponse = await axios.post("https://querydoc-rlsu.onrender.com/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const extractedText = uploadResponse.data.text;

      const askQuestionResponse = await axios.post("https://querydoc-rlsu.onrender.com/ask", { text: extractedText, question });

      setAnswer(askQuestionResponse.data.answer);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>QueryDoc</h1>
      <p>Discover Answers: Upload a PDF, Ask Questions, Gain Insights!</p>
      <div className="form-group">
        <label htmlFor="fileInput">Upload PDF File:</label>
        <input id="fileInput" type="file" onChange={handleFileChange} />
      </div>
      <div className="form-group">
        <label htmlFor="questionInput">Enter your question:</label>
        <textarea id="questionInput" rows={4} cols={50} placeholder="Enter your question..." value={question} onChange={handleQuestionChange} />
      </div>
      <button onClick={handleSubmit} disabled={loading}>{loading ? 'Loading...' : 'Ask Question'}</button>
      {answer && (
        <div className="answer">
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default MainPage;

import React, { useState } from 'react';
import axios from 'axios';
import './mainPage.css'; // Import your CSS file

const MainPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
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


      const responseMessage = {
        sender: 'bot',
        text: askQuestionResponse.data.answer
      };
      const newMessage = {
        sender: 'user',
        text: question
      };



      setMessages([...messages, newMessage, responseMessage]);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 style={{ textAlign: "center" }}>QueryDoc</h1>
        <p style={{ textAlign: "center", marginBottom: "50px" }}>Upload a PDF, Ask Questions, Gain Insights!</p>
      </div>
      <div className="chat-container">
        <div className="chat">
          {messages.slice().reverse().map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input id="fileInput" type="file" onChange={handleFileChange} />
          <textarea id="questionInput" rows={4} placeholder="Enter your question..." value={question} onChange={handleQuestionChange} />
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Loading...' : 'Send'}</button>
        </div>
      </div>

    </>

  );
}

export default MainPage;

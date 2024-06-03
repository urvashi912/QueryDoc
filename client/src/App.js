import { useState } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const uploadResponse = await axios.post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const extractedText = uploadResponse.data.text;

      const askQuestionResponse = await axios.post("http://localhost:3001/ask", { text: extractedText, question });
      
      setAnswer(askQuestionResponse.data.answer);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    }
  };

  return (
    <div className="App">
      <h1>PDF Question-Answer App</h1>
      <input type="file" onChange={handleFileChange} />
      <br />
      <textarea rows={4} cols={50} placeholder="Enter your question..." value={question} onChange={handleQuestionChange} />
      <br />
      <button onClick={handleSubmit}>Ask Question</button>
      <br />
      {answer && (
        <div>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
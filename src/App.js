import "./App.css";
import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import preprocessImage from "./preprocess";

function App() {
  const [file, setFile] = useState();
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("");
  const [process, setProcess] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const onFileChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };

  const preProcessedImage = () => {
    const canvas = canvasRef.current;
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.putImageData(preprocessImage(canvas), 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    setResult("");
    setStatus("");
    setProgress(0);
    Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => {
        setStatus(m.status);
        setProgress(m.progress);
      },
    })
      .then(({ data: { text } }) => {
        setResult(text);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const processImage = () => {
    setResult("");
    setStatus("");
    setProgress(0);

    Tesseract.recognize(file, "eng", {
      logger: (m) => {
        setStatus(m.status);
        setProgress(m.progress);
      },
    })
      .then(({ data: { text } }) => {
        setResult(text);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="App">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="statusContainer">
          <h3>OCR Web-app powered by Tesseract.js</h3>

          <input
            type="file"
            onChange={onFileChange}
            style={{ marginTop: "2rem" }}
          />

          <button
            onClick={() => {
              setProcess(!process);
            }}
            style={{ marginTop: "2rem" }}
          >
            Process image - {process ? "ON" : "OFF"}
          </button>

          <input
            type="button"
            value="Submit"
            onClick={process ? preProcessedImage : processImage}
            style={{ marginTop: "2rem" }}
          />

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>{status}</div>
            <progress value={progress} max={1} />
          </div>
        </div>

        {file && (
          <div className="imageContainer">
            <div className="sectionContainer">
              <h3>Uploaded Image</h3>
              <img
                src={file}
                style={{ display: "none" }}
                alt="Upload an Image"
                ref={imageRef}
              />
              <img src={file} style={{ width: "100%" }} alt="Upload an Image" />
            </div>
            {process && (
              <div className="sectionContainer">
                <h3>Processed Image</h3>
                <canvas ref={canvasRef} style={{ width: "100%" }}></canvas>
              </div>
            )}
          </div>
        )}
      </div>

      {result !== "" && (
        <div className="resultContainer">
          <h3>Result</h3>
          <div style={{ marginTop: 20, fontSize: 24, color: "teal" }}>
            Result: {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

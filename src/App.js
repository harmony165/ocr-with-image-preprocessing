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
      <input type="file" onChange={onFileChange} />

      <button
        onClick={() => {
          setProcess(!process);
        }}
      >
        Process image - {process ? "ON" : "OFF"}
      </button>
      <div style={{ marginTop: 25 }}>
        <input
          type="button"
          value="Submit"
          onClick={process ? preProcessedImage : processImage}
        />
      </div>
      <div>
        <div>{status}</div>
        <progress value={progress} max={1} />
      </div>

      {file && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            aligntItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <h3>Actual image uploaded</h3>
            <img
              src={file}
              
              alt="Upload an Image"
              ref={imageRef}
            />
          </div>
          {process && (
            <div>
              <h3>Processed Image</h3>
              <canvas ref={canvasRef} ></canvas>
            </div>
          )}
        </div>
      )}

      {result !== "" && (
        <div style={{ marginTop: 20, fontSize: 24, color: "teal" }}>
          Result: {result}
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawingGrid from "./components/DrawingGrid";
import OutputBar from "./components/OutputBar";

export default function App() {
  const [predictedIndex, setPredictedIndex] = useState(null);
  const [model, setModel] = useState(null);
  const [output, setOutput] = useState(Array(10).fill(0));
  const [status, setStatus] = useState("Loading model...");
  const [grid, setGrid] = useState(
    Array(28)
      .fill(null)
      .map(() => Array(28).fill(0)),
  );

  useEffect(() => {
    async function loadModel() {
      try {
        // loadLayersModel expects the converted Keras model topology
        const m = await tf.loadLayersModel("/model/model.json");
        setModel(m);
        setStatus("Model Ready!");
      } catch (err) {
        console.error("Path Error:", err);
        setStatus("Error loading model files");
      }
    }
    loadModel();
  }, []);

  const predict = async () => {
    if (!model) return;

    // tf.tidy prevents memory leaks by cleaning up intermediate tensors
    const results = tf.tidy(() => {
      const flatData = grid.flat().map((v) => (v ? 1.0 : 0.0));
      // MNIST models typically expect a 2D tensor of shape [1, 784]
      const input = tf.tensor2d(flatData, [1, 784]);
      const prediction = model.predict(input);
      return prediction.dataSync(); // Sync results from GPU to CPU
    });

    const dataArray = Array.from(results);
    setOutput(dataArray);
    setPredictedIndex(dataArray.indexOf(Math.max(...dataArray)));
  };

  const clearGrid = () => {
    setGrid(
      Array(28)
        .fill(null)
        .map(() => Array(28).fill(0)),
    );
    setPredictedIndex(null);
    setOutput(Array(10).fill(0));
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", textAlign: "center" }}>
      <h3 style={{ color: status === "Model Ready!" ? "green" : "red" }}>
        {status}
      </h3>
      {predictedIndex !== null && (
        <h1 style={{ fontSize: "40px" }}>Predicted: {predictedIndex}</h1>
      )}
      <OutputBar output={output} predictedIndex={predictedIndex} />
      <div
        style={{
          display: "inline-block",
          border: "2px solid #333",
          marginTop: 10,
        }}
      >
        <DrawingGrid grid={grid} setGrid={setGrid} />
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={predict} style={buttonStyle("#007bff")}>
          Predict
        </button>
        <button onClick={clearGrid} style={buttonStyle("#6c757d", "10px")}>
          Clear
        </button>
      </div>
    </div>
  );
}

const buttonStyle = (bg, marginLeft = "0px") => ({
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: bg,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginLeft: marginLeft,
});

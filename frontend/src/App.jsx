import React from "react";

import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawingGrid from "./components/DrawingGrid";
import OutputBar from "./components/OutputBar";

export default function App() {
  const [predictedIndex, setPredictedIndex] = useState(null);

  const [model, setModel] = useState(null);
  const [grid, setGrid] = useState(
    Array(28)
      .fill(null)
      .map(() => Array(28).fill(0)),
  );
  const [output, setOutput] = useState(Array(10).fill(0));
  const [status, setStatus] = useState("Loading model...");

  useEffect(() => {
    tf.loadGraphModel("/model/model.json")
      .then((m) => {
        setModel(m);
        setStatus("Model loaded");
      })
      .catch((err) => {
        console.error(err);
        setStatus("Failed to load model");
      });
  }, []);

  const predict = async () => {
    if (!model) {
      console.log("Model not loaded yet");
      return;
    }

    // Create input tensor
    const inputTensor = tf.tensor(
      grid.flat().map((v) => (v ? 1.0 : 0.0)),
      [1, 784],
      "float32",
    );

    // Execute graph model
    const result = model.execute(inputTensor);

    // GraphModel may return Tensor or Tensor[]
    const outputTensor = Array.isArray(result) ? result[0] : result;

    const data = await outputTensor.data();
    setOutput(Array.from(data));

    const dataArray = Array.from(data);
    setOutput(dataArray);

    const maxIndex = dataArray.indexOf(Math.max(...dataArray));
    setPredictedIndex(maxIndex);

    // Cleanup (important)
    inputTensor.dispose();
    outputTensor.dispose();

    console.log("Prediction:", dataArray);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h3>{status}</h3>

      <OutputBar output={output} />

      <DrawingGrid grid={grid} setGrid={setGrid} />

      <button onClick={predict} style={{ marginTop: 12 }}>
        Predict
      </button>
    </div>
  );
}

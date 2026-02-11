import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawingGrid from "./components/DrawingGrid";
import OutputBar from "./components/OutputBar";

export default function App() {
  const [predictedIndex, setPredictedIndex] = useState(null);
  const [model, setModel] = useState(null);
  const [output, setOutput] = useState(Array(10).fill(0));
  const [status, setStatus] = useState("Loading model...");
  const [activations, setActivations] = useState({ hidden: [], output: [] });
  const [grid, setGrid] = useState(
    Array(28)
      .fill(null)
      .map(() => Array(28).fill(0)),
  );

  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const m = await tf.loadLayersModel("/model/model.json");
        // DEBUG: Check your model structure in the browser console (F12)
        console.log(
          "Model Layers:",
          m.layers.map((l, i) => `${i}: ${l.name}`),
        );
        m.summary(); // Prints architecture to console

        setModel(m);
        setStatus("Model Ready!");
      } catch (err) {
        console.error("Path Error:", err);
        setStatus("Error loading model files");
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    if (model) predictWithActivations();
  }, [grid, model]);

  const predictWithActivations = async () => {
    if (!model) return;

    try {
      const results = tf.tidy(() => {
        const flatData = grid.flat().map((v) => (v ? 1.0 : 0.0));
        const input = tf.tensor2d(flatData, [1, 784]);

        // Find the first Dense or Flatten layer to use as "hidden"
        // Most MNIST models use layer 0 or 1 for the first set of neurons
        const hiddenLayerIdx = model.layers.length > 1 ? 0 : 0;

        const intermediateModel = tf.model({
          inputs: model.inputs,
          outputs: [model.layers[hiddenLayerIdx].output, model.outputs[0]],
        });

        const [hiddenOut, finalOut] = intermediateModel.predict(input);

        return {
          hidden: Array.from(hiddenOut.dataSync()).slice(0, 20), // Grab first 20 neurons
          output: Array.from(finalOut.dataSync()),
        };
      });

      setActivations(results);
      setOutput(results.output);
      setPredictedIndex(results.output.indexOf(Math.max(...results.output)));
    } catch (e) {
      console.error("Visualization Error:", e);
    }
  };

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activations.hidden.length) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 400, 400);

    // Draw active pixels to hidden neurons
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell > 0) {
          activations.hidden.forEach((hVal, i) => {
            if (hVal < 0.01) return;
            ctx.beginPath();
            ctx.moveTo(c * 2 + 10, r * 2 + 150); // Grid position
            ctx.lineTo(200, i * 15 + 50); // Hidden layer position
            ctx.strokeStyle = `rgba(0, 123, 255, ${Math.min(hVal, 0.2)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          });
        }
      });
    });

    // Draw hidden neurons to output
    activations.hidden.forEach((hVal, i) => {
      activations.output.forEach((oVal, j) => {
        ctx.beginPath();
        ctx.moveTo(200, i * 15 + 50);
        ctx.lineTo(380, j * 35 + 40); // Connection to output digits
        ctx.strokeStyle = `rgba(255, 100, 0, ${oVal * 0.3})`;
        ctx.lineWidth = oVal * 2;
        ctx.stroke();
      });
    });
  }, [activations, grid]);

  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <h3 style={{ color: status.includes("Ready") ? "green" : "red" }}>
        {status}
      </h3>
      <OutputBar output={output} predictedIndex={predictedIndex} />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: 20,
        }}
      >
        <div style={{ border: "2px solid #333", background: "white" }}>
          <DrawingGrid grid={grid} setGrid={setGrid} />
        </div>

        <div
          style={{
            background: "white",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <p style={{ fontSize: "12px", color: "#666" }}>
            Neural Connections (Live)
          </p>
          <canvas ref={canvasRef} width={400} height={400} />
        </div>
      </div>

      <button
        onClick={() =>
          setGrid(
            Array(28)
              .fill(null)
              .map(() => Array(28).fill(0)),
          )
        }
        style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
      >
        Clear Grid
      </button>
    </div>
  );
}

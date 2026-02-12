import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawingGrid from "./components/DrawingGrid";
import OutputBar from "./components/OutputBar";

export default function App() {
  const [predictedIndex, setPredictedIndex] = useState(null);
  const [model, setModel] = useState(null);
  const [output, setOutput] = useState(Array(10).fill(0));
  const [status, setStatus] = useState("Loading model...");
  const [activations, setActivations] = useState({
    input: 0,
    hidden: [0, 0, 0, 0],
    output: [0, 0],
  });
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
        setModel(m);
        setStatus("Model Ready!");
      } catch (err) {
        setStatus("Error loading model");
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    if (model) predict();
  }, [grid, model]);

  const predict = async () => {
    if (!model) return;
    tf.tidy(() => {
      const flatData = grid.flat().map((v) => (v ? 1.0 : 0.0));
      const inputTensor = tf.tensor2d(flatData, [1, 784]);

      // Get real data from the model layers
      const hiddenLayer = model.layers[0];
      const intermediateModel = tf.model({
        inputs: model.inputs,
        outputs: [hiddenLayer.output, model.outputs[0]],
      });
      const [hOut, fOut] = intermediateModel.predict(inputTensor);

      const hData = Array.from(hOut.dataSync());
      const fData = Array.from(fOut.dataSync());

      // Update state with actual activation levels (normalized)
      setActivations({
        input: flatData.filter((v) => v > 0).length / 100, // Average input density
        hidden: [hData[0], hData[1], hData[2], hData[3]], // Real neuron values
        output: [fData[predictedIndex || 0], fData[(predictedIndex + 1) % 10]], // Top 2 outputs
      });
      setOutput(fData);
      setPredictedIndex(fData.indexOf(Math.max(...fData)));
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 300);

    const layers = [
      {
        count: 3,
        x: 50,
        vals: [activations.input, activations.input, activations.input],
      },
      { count: 4, x: 200, vals: activations.hidden },
      { count: 2, x: 350, vals: activations.output },
    ];

    const getY = (index, total) => (300 / (total + 1)) * (index + 1);

    // Draw Connections
    layers.forEach((layer, i) => {
      if (i === layers.length - 1) return;
      const nextLayer = layers[i + 1];
      layer.vals.forEach((v1, j) => {
        nextLayer.vals.forEach((v2, k) => {
          ctx.beginPath();
          ctx.moveTo(layer.x, getY(j, layer.count));
          ctx.lineTo(nextLayer.x, getY(k, nextLayer.count));
          // Line glows based on the activation of the two nodes it connects
          const strength = (v1 + v2) / 2;
          ctx.strokeStyle = `rgba(0, 123, 255, ${0.1 + strength * 0.8})`;
          ctx.lineWidth = 0.5 + strength * 2;
          ctx.stroke();
        });
      });
    });

    // Draw Nodes
    layers.forEach((layer) => {
      layer.vals.forEach((val, i) => {
        const y = getY(i, layer.count);
        ctx.beginPath();
        ctx.arc(layer.x, y, 18, 0, Math.PI * 2);
        // Node turns blue/glows based on real-time activation
        ctx.fillStyle = `rgba(0, 123, 255, ${0.2 + val})`;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }, [activations]);

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#333" }}>
        Digit Recognized:{" "}
        <span style={{ color: "blue", fontSize: "40px" }}>
          {predictedIndex}
        </span>
      </h2>
      <p>{status}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginTop: 20,
        }}
      >
        <div style={{ border: "3px solid #333", background: "white" }}>
          <DrawingGrid grid={grid} setGrid={setGrid} />
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        >
          <canvas ref={canvasRef} width={400} height={300} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            <span>INPUT</span>
            <span>HIDDEN</span>
            <span>OUTPUT</span>
          </div>
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
        style={{
          marginTop: 20,
          padding: "10px 30px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Clear
      </button>
    </div>
  );
}

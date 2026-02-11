import React, { useEffect, useRef } from "react";

export default function NeuralVis({ grid, activations }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 600, 300); // Clear for redraw

    if (activations.length < 3) return;

    const [inputData, hiddenData, outputData] = activations;

    // 1. Draw Input -> Hidden connections
    // Only draw from pixels that are "on" (inked) to save performance
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell > 0) {
          hiddenData.forEach((hVal, i) => {
            if (hVal < 0.1) return; // Skip weak neurons
            ctx.beginPath();
            ctx.moveTo(c * 5 + 20, r * 5 + 50); // Start at grid pixel
            ctx.lineTo(300, i * 15 + 20); // End at hidden neuron
            ctx.strokeStyle = `rgba(0, 123, 255, ${hVal * 0.1})`;
            ctx.stroke();
          });
        }
      });
    });

    // 2. Draw Hidden -> Output connections
    hiddenData.forEach((hVal, i) => {
      outputData.forEach((oVal, j) => {
        ctx.beginPath();
        ctx.moveTo(300, i * 15 + 20);
        ctx.lineTo(550, j * 30 + 20); // End at output digit
        ctx.strokeStyle = `rgba(255, 165, 0, ${oVal * hVal})`;
        ctx.lineWidth = oVal * 2;
        ctx.stroke();
      });
    });
  }, [grid, activations]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      style={{ border: "1px solid #ddd" }}
    />
  );
}

import React, { useState } from "react";

export default function DrawingGrid({ grid, setGrid }) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const paint = (r, c) => {
    const newGrid = [...grid.map((row) => [...row])];

    // Paint the center pixel and its neighbors to create a "thick" stroke
    const pixelsToPaint = [
      [r, c],
      [r + 1, c],
      [r, c + 1],
      [r + 1, c + 1],
    ];

    pixelsToPaint.forEach(([row, col]) => {
      if (row >= 0 && row < 28 && col >= 0 && col < 28) {
        newGrid[row][col] = 1;
      }
    });

    setGrid(newGrid);
  };

  const handleMouseEnter = (r, c) => {
    if (isMouseDown) {
      paint(r, c);
    }
  };

  const handleMouseDown = (r, c) => {
    setIsMouseDown(true);
    paint(r, c);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(28, 15px)",
        userSelect: "none", // Prevents highlighting the grid while drawing
        cursor: "crosshair",
      }}
      // Stop drawing if the mouse leaves the grid area or is released
      onMouseLeave={() => setIsMouseDown(false)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            onMouseDown={() => handleMouseDown(i, j)}
            onMouseEnter={() => handleMouseEnter(i, j)}
            style={{
              width: 15,
              height: 15,
              backgroundColor: cell ? "black" : "#fff",
              border: "1px solid #eee",
            }}
          />
        )),
      )}
    </div>
  );
}

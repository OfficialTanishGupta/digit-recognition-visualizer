import React from "react";

export default function DrawingGrid({ grid, setGrid }) {
  const paint = (r, c) => {
    const copy = grid.map((row) => [...row]);
    copy[r][c] = 1;
    setGrid(copy);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(28, 14px)",
        userSelect: "none",
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            onMouseDown={() => paint(i, j)}
            style={{
              width: 14,
              height: 14,
              backgroundColor: cell ? "black" : "#eee",
              border: "1px solid #ccc",
            }}
          />
        )),
      )}
    </div>
  );
}

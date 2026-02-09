import React from "react";

export default function OutputBar({ output, predictedIndex }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {output.map((_, i) => (
        <div
          key={i}
          style={{
            width: 40,
            height: 40,
            backgroundColor: predictedIndex === i ? "black" : "#ddd",
            color: predictedIndex === i ? "white" : "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

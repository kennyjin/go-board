import React from "react";

export default function GoBoard({
  size,
  board,
  turn,
  hover,
  ko,
  px,
  zoom,
  padding,
  cell,
  starCoords,
  setHover,
  playAt,
  safeAt,
  inBounds,
}) {
  return (
    <svg
      viewBox={`0 0 ${px} ${px}`}
      width={(px * zoom) / 100}
      height={(px * zoom) / 100}
      className="block"
      onMouseLeave={() => setHover(null)}
    >
      {/* Grid lines */}
      {Array.from({ length: size }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={padding + i * cell}
          y1={padding}
          x2={padding + i * cell}
          y2={px - padding}
          stroke="#1f1f1f"
          strokeWidth={1.25}
        />
      ))}
      {Array.from({ length: size }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={padding}
          y1={padding + i * cell}
          x2={px - padding}
          y2={padding + i * cell}
          stroke="#1f1f1f"
          strokeWidth={1.25}
        />
      ))}

      {/* Star (hoshi) points */}
      {starCoords.map((pt, idx) => (
        <circle
          key={`star-${idx}`}
          cx={padding + pt.c * cell}
          cy={padding + pt.r * cell}
          r={size === 19 ? 4 : size === 13 ? 3 : 2.5}
          fill="#1f1f1f"
        />
      ))}

      {/* Ko marker */}
      {ko && (
        <circle
          cx={padding + ko.c * cell}
          cy={padding + ko.r * cell}
          r={cell * 0.18}
          fill="none"
          stroke="#b45309"
          strokeDasharray="2,2"
          strokeWidth={1.25}
        />
      )}

      {/* Hover ghost stone */}
      {hover &&
        inBounds(hover.r, hover.c, size) &&
        safeAt(board, hover.r, hover.c) === 0 && (
          <circle
            cx={padding + hover.c * cell}
            cy={padding + hover.r * cell}
            r={cell * 0.45}
            fill={turn === 1 ? "black" : "white"}
            opacity={0.45}
            stroke="#111"
          />
        )}

      {/* Stones */}
      {board.map((row, r) =>
        row.map((v, c) => {
          if (v === 0) return null;
          return (
            <circle
              key={`s-${r}-${c}`}
              cx={padding + c * cell}
              cy={padding + r * cell}
              r={cell * 0.45}
              fill={v === 1 ? "black" : "white"}
              stroke="#111"
            />
          );
        })
      )}

      {/* Click/hover hotspots */}
      {Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) => (
          <rect
            key={`hit-${r}-${c}`}
            x={padding + c * cell - cell / 2}
            y={padding + r * cell - cell / 2}
            width={cell}
            height={cell}
            fill="transparent"
            onMouseEnter={() => setHover({ r, c })}
            onClick={() => playAt(r, c)}
            style={{
              cursor: safeAt(board, r, c) === 0 ? "pointer" : "not-allowed",
            }}
          />
        ))
      )}
    </svg>
  );
}

import React from "react";

export default function BoardControls({ zoom, setZoom, size, setSize }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="opacity-80">Zoom:</span>
        <input
          type="range"
          min="50"
          max="150"
          step="5"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <span>{zoom}%</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="opacity-80">Board:</span>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="bg-neutral-900 rounded px-2 py-1 border border-neutral-800"
        >
          <option value={9}>9×9</option>
          <option value={13}>13×13</option>
          <option value={19}>19×19</option>
        </select>
      </label>
    </div>
  );
}

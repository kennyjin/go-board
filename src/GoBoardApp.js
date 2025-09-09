import React, { useEffect, useRef, useState } from "react";

export default function GoBoardApp() {
  const [size, setSize] = useState(19);
  const [board, setBoard] = useState(() => createBoard(19)); // 0 empty, 1 black, 2 white
  const [turn, setTurn] = useState(1); // 1 = Black, 2 = White
  const [hover, setHover] = useState(null);
  const [ko, setKo] = useState(null); // {r,c} point forbidden for immediate recapture
  // --- responsive sizing + zoom ---
  const wrapperRef = useRef(null);
  const [px, setPx] = useState(480); // base board pixels (auto)
  const [zoom, setZoom] = useState(100); // 50–150%

  useEffect(() => {
    setBoard(createBoard(size));
    setTurn(1);
    setHover(null);
    setKo(null);
    setKo(null);
  }, [size]);

  // Observe container width and fit board into it (min 320, max 560)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setPx(Math.max(320, Math.min(560, Math.floor(w))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padding = 32;
  const cell = (px - padding * 2) / (size - 1);

  // ---- GAME LOGIC: captures + ko ----
  function playAt(r, c) {
    // Ko: forbid immediate recapture at ko point
    if (ko && ko.r === r && ko.c === c) return;
    if (board[r][c] !== 0) return;

    const color = turn;
    const enemy = color === 1 ? 2 : 1;
    let next = cloneBoard(board);
    next[r][c] = color; // tentatively place

    // 1) remove adjacent enemy groups with 0 liberties
    const adj = neighbors(r, c, size);
    const seenEnemy = new Set();
    let captured = [];

    for (const [ar, ac] of adj) {
      if (next[ar][ac] !== enemy) continue;
      const key = ar + "," + ac;
      if (seenEnemy.has(key)) continue;
      const group = getGroup(next, ar, ac, size);
      group.forEach(([gr, gc]) => seenEnemy.add(gr + "," + gc));
      const libs = countLiberties(next, group, size);
      if (libs === 0) {
        // capture: remove the entire enemy group
        for (const [gr, gc] of group) {
          next[gr][gc] = 0;
          captured.push([gr, gc]);
        }
      }
    }

    // 2) check suicide: if our own group now has 0 liberties and we didn't capture anything, move is illegal
    const myGroup = getGroup(next, r, c, size);
    const myLibs = libertySet(next, myGroup, size);
    if (myLibs.size === 0 && captured.length === 0) {
      // illegal (suicide) — do nothing
      return;
    }

    // 3) Ko logic: if exactly one stone was captured and our group has exactly one liberty
    // and that liberty equals the captured point, set ko there (one-turn ban)
    let newKo = null;
    if (captured.length === 1 && myLibs.size === 1) {
      const onlyLib = [...myLibs][0];
      const [lr, lc] = onlyLib.split(",").map(Number);
      const [cr, cc] = captured[0];
      if (lr === cr && lc === cc) newKo = { r: cr, c: cc };
    }

    setBoard(next);
    setTurn(color === 1 ? 2 : 1);
    setKo(newKo);
  }

  // --- star (hoshi) points ---
  function getStarTriplets(n) {
    if (n === 19) return [3, 9, 15];
    if (n === 13) return [3, 6, 9];
    if (n === 9) return [2, 4, 6];
    return [];
  }
  const starTriplets = getStarTriplets(size);
  const starCoords = [];
  for (let r of starTriplets)
    for (let c of starTriplets) starCoords.push({ r, c });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center">
      <header className="w-full max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl">Go Board</h1>
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
      </header>

      <div className="w-full max-w-3xl" ref={wrapperRef}>
        <div style={{ width: (px * zoom) / 100, height: (px * zoom) / 100 }}>
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

            {/* Star points */}
            {starCoords.map((pt, idx) => (
              <circle
                key={`star-${idx}`}
                cx={padding + pt.c * cell}
                cy={padding + pt.r * cell}
                r={size === 19 ? 4 : size === 13 ? 3 : 2.5}
                fill="#1f1f1f"
              />
            ))}

            {/* Hover ghost stone */}
            {hover && board[hover.r][hover.c] === 0 && (
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
                    cursor: board[r][c] === 0 ? "pointer" : "not-allowed",
                  }}
                />
              ))
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---- helpers ----
function createBoard(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
}

function inBounds(r, c, n) {
  return r >= 0 && r < n && c >= 0 && c < n;
}

function neighbors(r, c, n) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const res = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr,
      nc = c + dc;
    if (inBounds(nr, nc, n)) res.push([nr, nc]);
  }
  return res;
}

function getGroup(board, r, c, n) {
  const color = board[r][c];
  const stack = [[r, c]];
  const seen = new Set([r + "," + c]);
  const group = [];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    group.push([cr, cc]);
    for (const [nr, nc] of neighbors(cr, cc, n)) {
      if (board[nr][nc] !== color) continue;
      const k = nr + "," + nc;
      if (!seen.has(k)) {
        seen.add(k);
        stack.push([nr, nc]);
      }
    }
  }
  return group;
}

function countLiberties(board, group, n) {
  return libertySet(board, group, n).size;
}

function libertySet(board, group, n) {
  const libs = new Set();
  for (const [r, c] of group) {
    for (const [nr, nc] of neighbors(r, c, n)) {
      if (board[nr][nc] === 0) libs.add(nr + "," + nc);
    }
  }
  return libs;
}

function cloneBoard(b) {
  return b.map((row) => row.slice());
}

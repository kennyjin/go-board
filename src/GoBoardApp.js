import React, { useEffect, useRef, useState } from "react";
import GoBoard from "./GoBoard";
import BoardControls from "./BoardControls";
import Header from "./Header";
import {
  createBoard,
  inBounds,
  neighbors,
  getGroup,
  libertySet,
  countLiberties,
  cloneBoard,
  safeAt,
  getStarTriplets,
} from "./goUtils";

export default function GoBoardApp() {
  const [size, setSize] = useState(19); // 9, 13, 19
  const [board, setBoard] = useState(() => createBoard(19)); // 0 empty, 1 black, 2 white
  const [turn, setTurn] = useState(1); // 1 = Black, 2 = White
  const [hover, setHover] = useState(null); // {r,c} or null
  const [ko, setKo] = useState(null); // {r,c} or null

  // Responsive sizing + zoom
  const wrapperRef = useRef(null);
  const [px, setPx] = useState(480); // base board pixels (auto-fitted)
  const [zoom, setZoom] = useState(100); // 50–150 (%)

  useEffect(() => {
    setBoard(createBoard(size));
    setTurn(1);
    setHover(null);
    setKo(null);
  }, [size]);

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

  // ---- GAME LOGIC (captures + suicide + ko) ----
  function playAt(r, c) {
    // Ignore out-of-bounds clicks (can happen during size change)
    if (!inBounds(r, c, size)) return;

    // Ko: forbid immediate recapture at ko point
    if (ko && ko.r === r && ko.c === c) return;

    if (safeAt(board, r, c) !== 0) return;

    const color = turn;
    const enemy = color === 1 ? 2 : 1;

    let next = cloneBoard(board);
    next[r][c] = color; // tentatively place

    // 1) remove adjacent enemy groups with 0 liberties
    const adj = neighbors(r, c, size);
    const seenEnemy = new Set();
    const captured = [];

    for (const [ar, ac] of adj) {
      if (!inBounds(ar, ac, size)) continue;
      if (safeAt(next, ar, ac) !== enemy) continue;

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

    // 2) suicide check: if our own group has 0 liberties and we didn't capture anything, it's illegal
    const myGroup = getGroup(next, r, c, size);
    const myLibsSet = libertySet(next, myGroup, size);
    if (myLibsSet.size === 0 && captured.length === 0) {
      // illegal (suicide)
      return;
    }

    // 3) ko detection: if exactly one stone was captured AND our group has exactly one liberty,
    // and that liberty equals the captured point -> set ko there for one turn
    let newKo = null;
    if (captured.length === 1 && myLibsSet.size === 1) {
      const onlyLib = [...myLibsSet][0]; // "r,c"
      const [lr, lc] = onlyLib.split(",").map(Number);
      const [cr, cc] = captured[0];
      if (lr === cr && lc === cc) {
        newKo = { r: cr, c: cc };
      }
    }

    setBoard(next);
    setTurn(color === 1 ? 2 : 1);
    setKo(newKo);
  }

  // Hoshi (star) points
  const starTriplets = getStarTriplets(size);
  const starCoords = [];
  for (let rr of starTriplets)
    for (let cc of starTriplets) starCoords.push({ r: rr, c: cc });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center">
      <Header>
        <BoardControls
          zoom={zoom}
          setZoom={setZoom}
          size={size}
          setSize={setSize}
        />
      </Header>
      <div className="w-full max-w-3xl" ref={wrapperRef}>
        <div style={{ width: (px * zoom) / 100, height: (px * zoom) / 100 }}>
          <GoBoard
            size={size}
            board={board}
            turn={turn}
            hover={hover}
            ko={ko}
            px={px}
            zoom={zoom}
            padding={padding}
            cell={cell}
            starCoords={starCoords}
            setHover={setHover}
            playAt={playAt}
            safeAt={safeAt}
            inBounds={inBounds}
          />
        </div>
      </div>
    </div>
  );
}

// ...helpers moved to goUtils.js...

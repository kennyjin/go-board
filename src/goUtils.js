export function createBoard(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
}

export function inBounds(r, c, n) {
  return r >= 0 && r < n && c >= 0 && c < n;
}

export function neighbors(r, c, n) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const res = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc, n)) res.push([nr, nc]);
  }
  return res;
}

export function getGroup(b, r, c, n) {
  const color = b[r][c];
  const stack = [[r, c]];
  const seen = new Set([r + "," + c]);
  const group = [];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    group.push([cr, cc]);
    for (const [nr, nc] of neighbors(cr, cc, n)) {
      if (b[nr][nc] !== color) continue;
      const k = nr + "," + nc;
      if (!seen.has(k)) {
        seen.add(k);
        stack.push([nr, nc]);
      }
    }
  }
  return group;
}

export function libertySet(b, group, n) {
  const libs = new Set();
  for (const [r, c] of group) {
    for (const [nr, nc] of neighbors(r, c, n)) {
      if (b[nr][nc] === 0) libs.add(nr + "," + nc);
    }
  }
  return libs;
}

export function countLiberties(b, group, n) {
  return libertySet(b, group, n).size;
}

export function cloneBoard(b) {
  return b.map((row) => row.slice());
}

export function safeAt(b, r, c) {
  return b[r] && typeof b[r][c] !== "undefined" ? b[r][c] : 0;
}

export function getStarTriplets(n) {
  if (n === 19) return [3, 9, 15];
  if (n === 13) return [3, 6, 9];
  if (n === 9) return [2, 4, 6];
  return [];
}

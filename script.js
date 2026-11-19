// Can You Escape the Maze? — BFS and DFS visualizer
// All search logic is JavaScript. No external libraries are required.

const ROWS = 15;
const COLS = 25;
const START = { row: 1, col: 1 };
const END = { row: 13, col: 23 };

const mazeElement = document.getElementById("maze");
const algorithmSelect = document.getElementById("algorithm");
const speedSelect = document.getElementById("speed");
const runBtn = document.getElementById("runBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");

const statusElement = document.getElementById("status");
const exploredCountElement = document.getElementById("exploredCount");
const frontierCountElement = document.getElementById("frontierCount");
const pathCountElement = document.getElementById("pathCount");
const algorithmLabelElement = document.getElementById("algorithmLabel");
const explainTitleElement = document.getElementById("explainTitle");
const explainTextElement = document.getElementById("explainText");
const questionElement = document.getElementById("question");
const progressBarElement = document.getElementById("progressBar");
const progressTextElement = document.getElementById("progressText");

let walls = new Set();
let cells = [];
let events = [];
let eventIndex = 0;
let timer = null;
let isPlaying = false;
let currentFrontier = [];
let explored = new Set();
let finalPath = [];
let searchFinished = false;

function keyOf(row, col) {
  return `${row},${col}`;
}

function makeMaze() {
  walls = new Set();

  // Outer border.
  for (let col = 0; col < COLS; col++) {
    walls.add(keyOf(0, col));
    walls.add(keyOf(ROWS - 1, col));
  }
  for (let row = 0; row < ROWS; row++) {
    walls.add(keyOf(row, 0));
    walls.add(keyOf(row, COLS - 1));
  }

  // Horizontal barriers with alternating gaps create a winding route.
  const barriers = [
    { row: 3, gap: 5 },
    { row: 6, gap: 18 },
    { row: 9, gap: 7 },
    { row: 12, gap: 20 }
  ];

  barriers.forEach(({ row, gap }) => {
    for (let col = 1; col < COLS - 1; col++) {
      if (col !== gap && col !== gap - 1 && col !== gap + 1) {
        walls.add(keyOf(row, col));
      }
    }
  });

  // A few extra obstacles make the search more interesting.
  [
    [1, 5], [2, 5], [4, 10], [5, 10], [7, 14], [8, 14],
    [10, 19], [11, 19], [4, 20], [5, 20], [7, 4], [8, 4]
  ].forEach(([row, col]) => walls.add(keyOf(row, col)));

  // Ensure the start and destination are always open.
  walls.delete(keyOf(START.row, START.col));
  walls.delete(keyOf(END.row, END.col));
}

function buildGrid() {
  mazeElement.innerHTML = "";
  cells = [];

  for (let row = 0; row < ROWS; row++) {
    cells[row] = [];
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (walls.has(keyOf(row, col))) {
        cell.classList.add("wall");
      } else if (row === START.row && col === START.col) {
        cell.classList.add("start");
        cell.textContent = "S";
      } else if (row === END.row && col === END.col) {
        cell.classList.add("end");
        cell.textContent = "E";
      }

      mazeElement.appendChild(cell);
      cells[row][col] = cell;
    }
  }
}

function getNeighbors(row, col) {
  // Four-direction movement: up, right, down, left.
  const candidates = [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1]
  ];

  return candidates.filter(([nextRow, nextCol]) => {
    const insideGrid =
      nextRow >= 0 && nextRow < ROWS &&
      nextCol >= 0 && nextCol < COLS;

    return insideGrid && !walls.has(keyOf(nextRow, nextCol));
  });
}

function reconstructPath(parent, endKey) {
  const path = [];
  let current = endKey;

  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = parent.get(current);
  }
  return path;
}

function createSearchEvents(algorithm) {
  const startKey = keyOf(START.row, START.col);
  const endKey = keyOf(END.row, END.col);
  const visited = new Set([startKey]);
  const parent = new Map([[startKey, null]]);
  const searchEvents = [];

  if (algorithm === "bfs") {
    // BFS: queue = first in, first out.
    const queue = [startKey];
    let head = 0;

    while (head < queue.length) {
      const currentKey = queue[head++];
      const [row, col] = currentKey.split(",").map(Number);

      searchEvents.push({
        type: "explore",
        current: currentKey,
        frontier: queue.slice(head),
        exploredCount: visited.size,
        title: "BFS explores the next queued node",
        text: "The queue is FIFO: the location discovered earliest is explored first."
      });

      if (currentKey === endKey) {
        const path = reconstructPath(parent, endKey);
        searchEvents.push({
          type: "found",
          current: currentKey,
          frontier: [],
          exploredCount: visited.size,
          path,
          title: "Destination found!",
          text: "BFS has found a shortest path because it explores the maze in layers of distance from the start."
        });
        break;
      }

      getNeighbors(row, col).forEach(([nextRow, nextCol]) => {
        const nextKey = keyOf(nextRow, nextCol);
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          parent.set(nextKey, currentKey);
          queue.push(nextKey);
        }
      });

      if (head >= queue.length && currentKey !== endKey) {
        searchEvents.push({
          type: "frontier",
          current: currentKey,
          frontier: [],
          exploredCount: visited.size,
          title: "The frontier is shrinking",
          text: "The frontier is the collection of discovered nodes waiting to be explored."
        });
      }
    }
  } else {
    // DFS: stack = last in, first out.
    const stack = [startKey];

    while (stack.length > 0) {
      const currentKey = stack.pop();
      const [row, col] = currentKey.split(",").map(Number);

      searchEvents.push({
        type: "explore",
        current: currentKey,
        frontier: stack.slice(),
        exploredCount: visited.size,
        title: "DFS follows a path",
        text: "The stack is LIFO: the most recently added location is explored next."
      });

      if (currentKey === endKey) {
        const path = reconstructPath(parent, endKey);
        searchEvents.push({
          type: "found",
          current: currentKey,
          frontier: stack.slice(),
          exploredCount: visited.size,
          path,
          title: "Destination found!",
          text: "DFS found a route, but unlike BFS, it does not guarantee that this route is the shortest."
        });
        break;
      }

      const neighbors = getNeighbors(row, col);
      // Reverse insertion order so the visual exploration direction is predictable.
      neighbors.reverse().forEach(([nextRow, nextCol]) => {
        const nextKey = keyOf(nextRow, nextCol);
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          parent.set(nextKey, currentKey);
          stack.push(nextKey);
        }
      });
    }
  }

  if (searchEvents.length === 0 || searchEvents[searchEvents.length - 1].type !== "found") {
    searchEvents.push({
      type: "notFound",
      current: null,
      frontier: [],
      exploredCount: visited.size,
      title: "No route found",
      text: "The algorithm exhausted all reachable locations without reaching the destination."
    });
  }

  return searchEvents;
}

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function renderBaseGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = cells[row][col];
      cell.className = "cell";

      if (walls.has(keyOf(row, col))) {
        cell.classList.add("wall");
      } else if (row === START.row && col === START.col) {
        cell.classList.add("start");
        cell.textContent = "S";
      } else if (row === END.row && col === END.col) {
        cell.classList.add("end");
        cell.textContent = "E";
      } else {
        cell.textContent = "";
      }
    }
  }
}

function paintCell(key, className) {
  if (!key) return;
  const [row, col] = key.split(",").map(Number);
  if (cells[row] && cells[row][col] && !walls.has(key)) {
    const cell = cells[row][col];
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      cell.className = `cell ${className}`;
    }
  }
}

function renderEvent(event) {
  if (event.type === "explore" || event.type === "frontier") {
    if (event.current !== keyOf(START.row, START.col) &&
        event.current !== keyOf(END.row, END.col)) {
      paintCell(event.current, "visited");
    }
    currentFrontier = event.frontier || [];
    currentFrontier.forEach(key => paintCell(key, "frontier"));
    explored.add(event.current);
  }

  if (event.type === "found") {
    finalPath = event.path || [];
    finalPath.forEach(key => {
      if (key !== keyOf(START.row, START.col) && key !== keyOf(END.row, END.col)) {
        paintCell(key, "path");
      }
    });
    searchFinished = true;
    statusElement.textContent = "Destination reached";
    pathCountElement.textContent = String(Math.max(0, finalPath.length - 1));
    explainTitleElement.textContent = event.title;
    explainTextElement.textContent = event.text;
    questionElement.textContent = "Why does BFS guarantee a shortest path in an unweighted graph, while DFS does not?";
  } else if (event.type === "notFound") {
    searchFinished = true;
    statusElement.textContent = "No route found";
    explainTitleElement.textContent = event.title;
    explainTextElement.textContent = event.text;
  } else {
    statusElement.textContent = "Searching…";
    explainTitleElement.textContent = event.title;
    explainTextElement.textContent = event.text;
  }

  exploredCountElement.textContent = String(event.exploredCount || explored.size);
  frontierCountElement.textContent = String((event.frontier || []).length);
  const percent = Math.round((eventIndex / events.length) * 100);
  progressBarElement.style.width = `${percent}%`;
  progressTextElement.textContent = `${percent}%`;
}

function stepForward() {
  if (eventIndex >= events.length) {
    stopPlayback();
    return;
  }
  renderEvent(events[eventIndex]);
  eventIndex++;
  if (eventIndex >= events.length) {
    stopPlayback();
  }
}

function getDelay() {
  const speeds = { slow: 500, normal: 180, fast: 45 };
  return speeds[speedSelect.value] || 180;
}

function startPlayback() {
  if (searchFinished) return;
  if (events.length === 0) prepareSearch();
  isPlaying = true;
  runBtn.textContent = "Ⅱ Pause";
  clearTimer();
  timer = setInterval(stepForward, getDelay());
}

function stopPlayback() {
  isPlaying = false;
  clearTimer();
  runBtn.textContent = searchFinished ? "✓ Complete" : "▶ Resume";
}

function prepareSearch() {
  clearTimer();
  eventIndex = 0;
  explored = new Set();
  currentFrontier = [];
  finalPath = [];
  searchFinished = false;
  renderBaseGrid();

  const algorithm = algorithmSelect.value;
  events = createSearchEvents(algorithm);
  algorithmLabelElement.textContent = algorithm.toUpperCase();
  statusElement.textContent = "Ready to search";
  exploredCountElement.textContent = "0";
  frontierCountElement.textContent = "0";
  pathCountElement.textContent = "—";
  progressBarElement.style.width = "0%";
  progressTextElement.textContent = "0%";
  explainTitleElement.textContent = algorithm === "bfs" ? "BFS is ready" : "DFS is ready";
  explainTextElement.textContent = algorithm === "bfs"
    ? "BFS will use a queue. Ask: why might exploring in layers help us find a shortest path?"
    : "DFS will use a stack. Ask: what happens when the algorithm follows a long path toward a dead end?";
  questionElement.textContent = algorithm === "bfs"
    ? "What does FIFO mean, and why does a queue have that behavior?"
    : "What does LIFO mean, and how does a stack create that behavior?";
  runBtn.textContent = "▶ Run";
  runBtn.disabled = false;
  stepBtn.disabled = false;
}

runBtn.addEventListener("click", () => {
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

stepBtn.addEventListener("click", () => {
  if (events.length === 0) prepareSearch();
  if (isPlaying) stopPlayback();
  stepForward();
});

resetBtn.addEventListener("click", prepareSearch);
algorithmSelect.addEventListener("change", prepareSearch);
speedSelect.addEventListener("change", () => {
  if (isPlaying) startPlayback();
});

makeMaze();
buildGrid();
prepareSearch();

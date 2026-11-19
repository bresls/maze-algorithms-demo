# Can You Escape the Maze? — JavaScript Visualizer

A classroom-ready BFS/DFS maze visualizer built with vanilla JavaScript, HTML, and CSS. It has no package dependencies and does not require an internet connection (the optional Google font falls back to system fonts).

## Run it in Visual Studio Code

1. Unzip `maze_escape_lesson.zip`.
2. Open Visual Studio Code.
3. Select **File → Open Folder** and choose the `maze_escape_lesson` folder.
4. In the Explorer, open `index.html`.
5. Recommended: install the **Live Server** extension by Ritwick Dey (Extensions icon in the left sidebar → search "Live Server" → Install).
6. Right-click `index.html` and choose **Open with Live Server**. Or click **Go Live** in the VS Code status bar.
7. Your browser should open the visualizer. Keep VS Code open to edit `script.js`, `styles.css`, or `index.html`.

### No extension option
You can also double-click `index.html` in Finder and open it in Chrome. The visualizer runs locally. Live Server is simply convenient because it refreshes the browser when you save code changes.

## What to demonstrate

- Choose **BFS** and press Run. The yellow cells are the frontier (discovered, waiting to be explored); blue cells have been explored; purple cells show the final path.
- Press Reset, choose **DFS**, and run it again.
- Use **Step** to pause and discuss one algorithm decision at a time.
- Change animation speed to slow when explaining the queue or stack.

## Teaching notes

- Each open cell is a graph node; legal moves to adjacent cells are edges.
- BFS uses a queue (FIFO) and finds a shortest path in an unweighted graph.
- DFS uses a stack (LIFO) and finds a route if one exists, but not necessarily the shortest.
- A `visited` Set prevents the algorithm from repeatedly processing the same cell.
- `parent` Map stores how each discovered cell was reached, allowing the final path to be reconstructed.

## Project files

- `index.html` — page structure and controls
- `styles.css` — layout, colors, responsive design
- `script.js` — maze generation, BFS/DFS logic, animation, and display updates

## Troubleshooting

- If the browser page is blank, check that `script.js` and `styles.css` are in the same folder as `index.html`.
- If Live Server is unavailable, open `index.html` directly in Chrome.
- If you edit code, save the file. Live Server should refresh automatically; otherwise refresh Chrome.

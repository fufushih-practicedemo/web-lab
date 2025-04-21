const ROWS = 6;
const COLS = 6;
const BLOCK_SIZE = 50;
const COOLDOWN = 1000;
let isFlipped = false;

function createTiles(row, col) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.innerHTML = `
    <div class="tile-face tile-front"></div>
    <div class="tile-face tile-back"></div>
  `;

  const bgPosition = `${col * 20}% ${row * 20}%`;
  const front = tile.querySelector(".tile-front");
  const back  = tile.querySelector(".tile-back");
  front.style.backgroundPosition = bgPosition;
  back .style.backgroundPosition = bgPosition;

  return tile;
}

function createBoard() {
  const board = document.querySelector(".board");
  for (let i = 0; i < ROWS; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < COLS; j++) {
      row.appendChild(createTiles(i, j));
    }
    board.appendChild(row);
  }
}

function initTileAnim() {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile, index) => {
    let lastEnterTime = 0;
    tile.addEventListener("mouseenter", () => {
      const now = Date.now();
      if (now - lastEnterTime > COOLDOWN) {
        lastEnterTime = now;
        // 根據 index%COLS 決定 tiltY...
        let tiltY = [ -40, -20, -10, 10, 20, 40 ][ index % COLS ];
        animateTile(tile, tiltY);
      }
    });
  });

  const flipButton = document.getElementById("flipButton");
  flipButton.addEventListener("click", () => flipAllTiles(tiles));
}

function animateTile(tile, tiltY) {
  gsap.timeline()
    .set(tile, { rotateX: isFlipped ? 180 : 0, rotateY: 0 })
    .to(tile, {
      rotateX: isFlipped ? 450 : 270,
      rotateY: tiltY,
      duration: 0.5,
      ease: "power2.out"
    })
    .to(tile, {
      rotateX: isFlipped ? 540 : 360,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.25");
}

function flipAllTiles(tiles) {
  isFlipped = !isFlipped;
  gsap.to(tiles, {
    rotateX: isFlipped ? 180 : 0,
    duration: 1,
    stagger: { amount: 0.5, from: "random" },
    ease: "power2.inOut"
  });
}

function createBlocks() {
  const container = document.getElementById("blocks");
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const cols = Math.ceil(screenW / BLOCK_SIZE);
  const rows = Math.ceil(screenH / BLOCK_SIZE);

  for (let i = 0, total = cols * rows; i < total; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    container.appendChild(block);
  }
  return { numCols: cols };
}

function highlightBlock(e) {
  const { numCols } = window.blockInfo;
  const container = document.getElementById("blocks");
  const rect = container.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / BLOCK_SIZE);
  const row = Math.floor((e.clientY - rect.top) / BLOCK_SIZE);
  const idx = row * numCols + col;
  const block = container.children[idx];
  if (block) {
    block.classList.add("highlight");
    setTimeout(() => block.classList.remove("highlight"), 250);
  }
}

function init() {
  createBoard();
  initTileAnim();
  window.blockInfo = createBlocks();
  document.addEventListener("mousemove", highlightBlock);
}

document.addEventListener("DOMContentLoaded", init);

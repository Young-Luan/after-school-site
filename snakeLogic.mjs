export const DIR = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function keyForCell(cell) {
  return `${cell.x},${cell.y}`;
}

export function isOppositeDirection(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function randomInt(rng, max) {
  return Math.floor(rng() * max);
}

export function randomEmptyCell(snake, width, height, rng = Math.random) {
  const occupied = new Set(snake.map(keyForCell));
  const empties = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = { x, y };
      if (!occupied.has(keyForCell(cell))) {
        empties.push(cell);
      }
    }
  }

  if (empties.length === 0) {
    return null;
  }

  return empties[randomInt(rng, empties.length)];
}

export function createInitialState(config = {}, rng = Math.random) {
  const width = config.width ?? 20;
  const height = config.height ?? 20;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];

  return {
    width,
    height,
    snake,
    direction: DIR.right,
    food: randomEmptyCell(snake, width, height, rng),
    score: 0,
    gameOver: false
  };
}

function inBounds(head, width, height) {
  return head.x >= 0 && head.x < width && head.y >= 0 && head.y < height;
}

export function tick(state, requestedDirection, rng = Math.random) {
  if (state.gameOver) {
    return state;
  }

  let direction = state.direction;
  if (requestedDirection && !isOppositeDirection(requestedDirection, state.direction)) {
    direction = requestedDirection;
  }

  const currentHead = state.snake[0];
  const newHead = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y
  };

  if (!inBounds(newHead, state.width, state.height)) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const eatsFood = state.food && sameCell(newHead, state.food);
  const collisionBody = eatsFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = collisionBody.some((part) => sameCell(part, newHead));
  if (hitSelf) {
    return {
      ...state,
      direction,
      gameOver: true
    };
  }

  const newSnake = [newHead, ...state.snake];

  if (!eatsFood) {
    newSnake.pop();
  }

  let nextFood = state.food;
  let nextScore = state.score;

  if (eatsFood) {
    nextScore += 1;
    nextFood = randomEmptyCell(newSnake, state.width, state.height, rng);
  }

  return {
    ...state,
    snake: newSnake,
    direction,
    food: nextFood,
    score: nextScore,
    gameOver: nextFood === null
  };
}

export function directionFromInput(input) {
  const key = input.toLowerCase();
  if (key === 'arrowup' || key === 'w' || key === 'up') return DIR.up;
  if (key === 'arrowdown' || key === 's' || key === 'down') return DIR.down;
  if (key === 'arrowleft' || key === 'a' || key === 'left') return DIR.left;
  if (key === 'arrowright' || key === 'd' || key === 'right') return DIR.right;
  return null;
}

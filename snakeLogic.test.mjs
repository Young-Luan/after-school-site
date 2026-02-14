import test from 'node:test';
import assert from 'node:assert/strict';
import { DIR, createInitialState, randomEmptyCell, tick } from '../src/snakeLogic.mjs';

test('moves one cell in current direction', () => {
  const state = {
    width: 8,
    height: 8,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIR.right,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, null, () => 0);

  assert.deepEqual(next.snake, [{ x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }]);
  assert.equal(next.gameOver, false);
  assert.equal(next.score, 0);
});

test('cannot reverse direction in one tick', () => {
  const state = {
    width: 8,
    height: 8,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIR.right,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, DIR.left, () => 0);

  assert.deepEqual(next.snake[0], { x: 4, y: 3 });
  assert.deepEqual(next.direction, DIR.right);
});

test('eats food, grows, increases score, and respawns food in empty cell', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
    direction: DIR.right,
    food: { x: 3, y: 2 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, null, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
  assert.notDeepEqual(next.food, { x: 3, y: 2 });
  assert.equal(next.snake.some((part) => part.x === next.food.x && part.y === next.food.y), false);
});

test('wall collision ends game', () => {
  const state = {
    width: 4,
    height: 4,
    snake: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
    direction: DIR.right,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, null, () => 0);

  assert.equal(next.gameOver, true);
});

test('self collision ends game', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 }
    ],
    direction: DIR.down,
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, DIR.left, () => 0);

  assert.equal(next.gameOver, true);
});

test('moving into old tail cell is allowed when not growing', () => {
  const state = {
    width: 6,
    height: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 }
    ],
    direction: DIR.up,
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false
  };

  const next = tick(state, DIR.left, () => 0);

  assert.equal(next.gameOver, false);
  assert.deepEqual(next.snake[0], { x: 1, y: 2 });
});

test('randomEmptyCell returns null when grid is full', () => {
  const fullSnake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];

  const cell = randomEmptyCell(fullSnake, 2, 2, () => 0);

  assert.equal(cell, null);
});

test('createInitialState is deterministic with fixed rng', () => {
  const a = createInitialState({ width: 10, height: 10 }, () => 0.2);
  const b = createInitialState({ width: 10, height: 10 }, () => 0.2);

  assert.deepEqual(a, b);
});

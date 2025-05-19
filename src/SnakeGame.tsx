// SnakeGame.tsx
import React, { useState, useEffect, useRef } from "react";
import useSound from "use-sound";
import popSfx from "./assets/pop.mp3";
import gameOverSfx from "./assets/gameover.mp3";

const boardSize = 10;
const initialSnake = [
  [0, 2],
  [0, 1],
  [0, 0],
];
const initialFood = [5, 5];

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState<[number, number]>([0, 1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(
    () => Number(localStorage.getItem("snake-score")) || 0
  );
  const [speed, setSpeed] = useState(200);
  const [difficulty, setDifficulty] = useState("normal");
  const moveRef = useRef(direction);

  const [playPop] = useSound(popSfx);
  const [playGameOver] = useSound(gameOverSfx);

  const restartGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection([0, 1]);
    setGameOver(false);
    setScore(0);
    localStorage.setItem("snake-score", "0");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (moveRef.current[0] !== 1) setDirection([-1, 0]);
          break;
        case "ArrowDown":
          if (moveRef.current[0] !== -1) setDirection([1, 0]);
          break;
        case "ArrowLeft":
          if (moveRef.current[1] !== 1) setDirection([0, -1]);
          break;
        case "ArrowRight":
          if (moveRef.current[1] !== -1) setDirection([0, 1]);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    localStorage.setItem("snake-score", String(score));
  }, [score]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = [
          prev[0][0] + moveRef.current[0],
          prev[0][1] + moveRef.current[1],
        ];
        if (
          newHead[0] < 0 ||
          newHead[1] < 0 ||
          newHead[0] >= boardSize ||
          newHead[1] >= boardSize ||
          prev.some(([x, y]) => x === newHead[0] && y === newHead[1])
        ) {
          setGameOver(true);
          playGameOver();
          return prev;
        }
        const newSnake = [newHead, ...prev];
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 1);
          setFood([
            Math.floor(Math.random() * boardSize),
            Math.floor(Math.random() * boardSize),
          ]);
          playPop();
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [food, gameOver, playPop, playGameOver, speed]);

  const handleDifficultyChange = (level: string) => {
    setDifficulty(level);
    switch (level) {
      case "easy":
        setSpeed(300);
        break;
      case "normal":
        setSpeed(200);
        break;
      case "hard":
        setSpeed(100);
        break;
    }
    restartGame();
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        padding: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>🐍 Snake Game</h1>
      <h2 style={{ margin: "1rem 0" }}>Score: {score}</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "10px" }}>Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => handleDifficultyChange(e.target.value)}
          style={{ padding: "0.3rem", fontSize: "1rem" }}
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      {gameOver && <h2 style={{ color: "red" }}>Game Over</h2>}
      <button
        onClick={restartGame}
        style={{
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
          fontSize: "1rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Restart
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, 24px)`,
          justifyContent: "center",
          gap: "2px",
          border: "3px solid #333",
          padding: "5px",
          backgroundColor: "#111",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {[...Array(boardSize)].flatMap((_, row) =>
          [...Array(boardSize)].map((_, col) => {
            const isSnake = snake.some(([x, y]) => x === row && y === col);
            const isFood = food[0] === row && food[1] === col;
            return (
              <div
                key={`${row}-${col}`}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: isSnake
                    ? "limegreen"
                    : isFood
                    ? "crimson"
                    : "#333",
                  borderRadius: isFood ? "50%" : "4px",
                  transition: "background-color 0.1s",
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default SnakeGame;

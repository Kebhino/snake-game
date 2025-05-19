// SnakeGame.tsx
import React, { useState, useEffect, useRef } from "react";
import useSound from "use-sound";
import popSfx from "./assets/pop.mp3";
import gameOverSfx from "./assets/gameover.mp3";
import recordSfx from "./assets/record.mp3";
import minecraftDirt from "./assets/kurczak.png";
import knightIcon from "./assets/rycerz.png";

const boardSize = 10;
const initialSnake = [
  [0, 2],
  [0, 1],
  [0, 0],
];

const generateNewFood = (snake: number[][]): [number, number] => {
  while (true) {
    const x = Math.floor(Math.random() * boardSize);
    const y = Math.floor(Math.random() * boardSize);
    if (!snake.some(([sx, sy]) => sx === x && sy === y)) {
      return [x, y];
    }
  }
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(generateNewFood(initialSnake));
  const [direction, setDirection] = useState<[number, number]>([0, 1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(
    () => Number(localStorage.getItem("snake-score")) || 0
  );
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("snake-highscore")) || 0
  );
  const [speed, setSpeed] = useState(200);
  const [difficulty, setDifficulty] = useState("normal");
  const [newHighScore, setNewHighScore] = useState(false);
  const [pendingHighScore, setPendingHighScore] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef(direction);

  const [playPop] = useSound(popSfx);
  const [playGameOver] = useSound(gameOverSfx);
  const [playRecord] = useSound(recordSfx);

  const showEasterEgg = difficulty === "dla Olisia";

  const restartGame = () => {
    const newSnake = initialSnake;
    setSnake(newSnake);
    const newFood = generateNewFood(newSnake);
    setFood(newFood);
    setDirection([0, 1]);
    moveRef.current = [0, 1];
    setGameOver(false);
    setScore(0);
    setNewHighScore(false);
    setPendingHighScore(false);
    localStorage.setItem("snake-score", "0");
    setTimeout(() => gameAreaRef.current?.focus(), 0);
  };

  const changeDirection = (newDir: [number, number]) => {
    if (
      (newDir[0] === -moveRef.current[0] && newDir[0] !== 0) ||
      (newDir[1] === -moveRef.current[1] && newDir[1] !== 0)
    )
      return;
    moveRef.current = newDir;
    setTimeout(() => setDirection(newDir), 0);
  };

  const renderMobileControls = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
      }}
    >
      <button onClick={() => changeDirection([-1, 0])}>⬆️</button>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => changeDirection([0, -1])}>⬅️</button>
        <button onClick={() => changeDirection([1, 0])}>⬇️</button>
        <button onClick={() => changeDirection([0, 1])}>➡️</button>
      </div>
    </div>
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        switch (e.key) {
          case "ArrowUp":
            changeDirection([-1, 0]);
            break;
          case "ArrowDown":
            changeDirection([1, 0]);
            break;
          case "ArrowLeft":
            changeDirection([0, -1]);
            break;
          case "ArrowRight":
            changeDirection([0, 1]);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (difficulty === "easy") setSpeed(300);
    else if (difficulty === "normal") setSpeed(200);
    else if (difficulty === "hard") setSpeed(100);
    else if (difficulty === "dla Olisia") setSpeed(90);
  }, [difficulty]);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    localStorage.setItem("snake-score", String(score));
    if (score > highScore) {
      setHighScore(score);
      setPendingHighScore(true);
      localStorage.setItem("snake-highscore", String(score));
    }
  }, [score, highScore]);

  useEffect(() => {
    if (!gameOver || !pendingHighScore) return;
    playRecord();
    setNewHighScore(true);
    setPendingHighScore(false);
  }, [gameOver, pendingHighScore, playRecord]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = [
          (prevSnake[0][0] + moveRef.current[0] + boardSize) % boardSize,
          (prevSnake[0][1] + moveRef.current[1] + boardSize) % boardSize,
        ];

        if (prevSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
          setGameOver(true);
          playGameOver();
          return prevSnake;
        }

        const isFoodEaten = newHead[0] === food[0] && newHead[1] === food[1];

        const newSnake = isFoodEaten
          ? [newHead, ...prevSnake]
          : [newHead, ...prevSnake.slice(0, -1)];

        if (isFoodEaten) {
          setScore((s) => s + 1);
          setTimeout(() => setFood(generateNewFood(newSnake)), 0);
          playPop();
        }

        return newSnake;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [food, gameOver, playPop, playGameOver, speed]);

  return (
    <div
      ref={gameAreaRef}
      tabIndex={0}
      style={{
        outline: "none",
        textAlign: "center",
        fontFamily: "Comic Sans MS, Arial",
        padding: "1rem",
        background: showEasterEgg ? "#1a472a" : "#1a1a1a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>🐍 Snake Game</h1>
      {showEasterEgg && (
        <h2 style={{ fontSize: "1.8rem", color: "#FFD700" }}>
          ✨ Tryb Minecraft dla Olisia! ⛏️✨
        </h2>
      )}
      <h2>Score: {score}</h2>
      <h3>High Score: {highScore}</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label>Difficulty:</label>{" "}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
          <option value="dla Olisia">dla Olisia</option>
        </select>
        <button onClick={restartGame} style={{ marginLeft: "1rem" }}>
          Restart
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, 24px)`,
          justifyContent: "center",
          gap: "2px",
          marginBottom: "1rem",
          border: "4px solid #4CAF50",
          padding: "4px",
          backgroundColor: showEasterEgg ? "#3c4b33" : "#333",
          boxShadow: showEasterEgg ? "0 0 20px #5e7c16" : "0 0 20px #4CAF50",
        }}
      >
        {[...Array(boardSize)].flatMap((_, row) =>
          [...Array(boardSize)].map((_, col) => {
            const isSnake = snake.some(([x, y]) => x === row && y === col);
            const isHead = snake[0][0] === row && snake[0][1] === col;
            const isFoodCell = food[0] === row && food[1] === col;

            const style: React.CSSProperties = isFoodCell
              ? showEasterEgg
                ? {
                    width: 24,
                    height: 24,
                    backgroundImage: `url(${minecraftDirt})`,
                    backgroundSize: "cover",
                    borderRadius: "4px",
                  }
                : {
                    width: 24,
                    height: 24,
                    backgroundColor: "crimson",
                    borderRadius: "50%",
                  }
              : isHead
              ? showEasterEgg
                ? {
                    width: 24,
                    height: 24,
                    backgroundImage: `url(${knightIcon})`,
                    backgroundSize: "cover",
                    borderRadius: "4px",
                  }
                : {
                    width: 24,
                    height: 24,
                    backgroundColor: "limegreen",
                    borderRadius: "4px",
                    boxShadow: "0 0 4px limegreen",
                  }
              : isSnake
              ? {
                  width: 24,
                  height: 24,
                  backgroundColor: showEasterEgg ? "#5e7c16" : "limegreen",
                  borderRadius: "4px",
                  boxShadow: showEasterEgg ? undefined : "0 0 4px limegreen",
                }
              : {
                  width: 24,
                  height: 24,
                  backgroundColor: showEasterEgg ? "#8b9a77" : "#444",
                  borderRadius: "4px",
                };

            return <div key={`${row}-${col}`} style={style} />;
          })
        )}
      </div>

      {newHighScore && (
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "#FFD700",
            color: "#000",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          🏆 Nowy rekord! 🏆
        </div>
      )}

      {renderMobileControls()}
    </div>
  );
};

export default SnakeGame;

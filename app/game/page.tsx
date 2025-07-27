"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const GRID_SIZE = 12;
const CELL_SIZE = 40; // pixels
const TOTAL_ROUNDS = 3;
const MOVING_OBSTACLE_COUNT = 4;
const COIN_COUNT = 10;

function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function getValidCoinPositions(obstacles, movingObstacles) {
  const coins = [];
  while (coins.length < COIN_COUNT) {
    const pos = getRandomPosition();
    const conflict =
      obstacles.some((o) => o.x === pos.x && o.y === pos.y) ||
      movingObstacles.some((o) => o.x === pos.x && o.y === pos.y) ||
      coins.some((c) => c.x === pos.x && c.y === pos.y);
    if (!conflict) coins.push(pos);
  }
  return coins;
}

export default function GamePage() {
  const router = useRouter();
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [goal, setGoal] = useState(getRandomPosition);
  const [obstacles, setObstacles] = useState([]);
  const [movingObstacles, setMovingObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [collected, setCollected] = useState(0);
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [paused, setPaused] = useState(false);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("highScore") || "0")
  );
  const timerRef = useRef(null);

  useEffect(() => {
    resetRound(round);
    setStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  useEffect(() => {
    if (!paused) {
      const interval = setInterval(() => {
        setMovingObstacles((prev) =>
          prev.map((obs) => {
            const dir = Math.floor(Math.random() * 4);
            let newX = obs.x;
            let newY = obs.y;
            if (dir === 0 && obs.y > 0) newY--;
            else if (dir === 1 && obs.y < GRID_SIZE - 1) newY++;
            else if (dir === 2 && obs.x > 0) newX--;
            else if (dir === 3 && obs.x < GRID_SIZE - 1) newX++;
            return { x: newX, y: newY };
          })
        );
      }, 500);
      return () => clearInterval(interval);
    }
  }, [paused]);

  useEffect(() => {
    const isCollided = [...obstacles, ...movingObstacles].some(
      (obs) => obs.x === player.x && obs.y === player.y
    );
    if (isCollided) {
      if (collected > highScore) {
        localStorage.setItem("highScore", collected.toString());
      }
      router.push(`/gameover?score=${collected}&round=${round}&high=${collected > highScore}`);
    }
  }, [player, obstacles, movingObstacles]);

  const resetRound = (r) => {
    setPlayer({ x: 0, y: 0 });
    setGoal(getRandomPosition());
    const newObstacles = Array(r * 4)
      .fill(0)
      .map(getRandomPosition);
    const newMoving = Array(MOVING_OBSTACLE_COUNT)
      .fill(0)
      .map(getRandomPosition);
    setObstacles(newObstacles);
    setMovingObstacles(newMoving);
    setCoins(getValidCoinPositions(newObstacles, newMoving));
  };

  const handleKeyDown = (e) => {
    if (paused) return;
    let { x, y } = player;
    if (e.key === "ArrowUp" && y > 0) y--;
    else if (e.key === "ArrowDown" && y < GRID_SIZE - 1) y++;
    else if (e.key === "ArrowLeft" && x > 0) x--;
    else if (e.key === "ArrowRight" && x < GRID_SIZE - 1) x++;
    setPlayer({ x, y });

    const coinIndex = coins.findIndex((coin) => coin.x === x && coin.y === y);
    if (coinIndex !== -1) {
      setCoins((prev) => prev.filter((_, i) => i !== coinIndex));
      setCollected((prev) => prev + 1);
    }

    if (x === goal.x && y === goal.y) {
      if (round < TOTAL_ROUNDS) {
        setRound((prev) => prev + 1);
      } else {
        if (collected > highScore) {
          localStorage.setItem("highScore", collected.toString());
        }
        router.push(`/gameover?score=${collected}&round=${round}&high=${collected > highScore}`);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, coins, paused]);

  const togglePause = () => setPaused(!paused);
  const restart = () => {
    setRound(1);
    setCollected(0);
    resetRound(1);
  };
  const exit = () => router.push("/");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="flex justify-between w-full max-w-xl px-4 mb-2">
        <div>Round: {round}</div>
        <div>Time: {timeTaken}s</div>
        <div>Coins: {collected}</div>
        <div>High Score: {highScore}</div>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: 2,
          backgroundColor: "#1e1e1e",
          padding: 4,
        }}
      >
        {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isPlayer = player.x === x && player.y === y;
          const isGoal = goal.x === x && goal.y === y;
          const isObstacle = obstacles.some((o) => o.x === x && o.y === y);
          const isMoving = movingObstacles.some((o) => o.x === x && o.y === y);
          const isCoin = coins.some((c) => c.x === x && c.y === y);
          return (
            <div
              key={i}
              className={`w-[${CELL_SIZE}px] h-[${CELL_SIZE}px] border flex items-center justify-center text-sm rounded ${
                isPlayer
                  ? "bg-blue-500"
                  : isGoal
                  ? "bg-green-500"
                  : isObstacle
                  ? "bg-red-500"
                  : isMoving
                  ? "bg-yellow-600 animate-pulse"
                  : isCoin
                  ? "bg-yellow-400"
                  : "bg-gray-800"
              }`}
            >
              {isPlayer ? "🙂" : isCoin ? "🟡" : ""}
            </div>
          );
        })}
      </div>

      <button
        onClick={togglePause}
        className="mt-4 px-4 py-2 bg-white text-black rounded"
      >
        {paused ? "Resume" : "Pause"}
      </button>

      {paused && (
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={restart} className="bg-blue-500 px-4 py-2 rounded">
            Restart
          </button>
          <button onClick={exit} className="bg-red-500 px-4 py-2 rounded">
            Exit
          </button>
        </div>
      )}
    </div>
  );
}


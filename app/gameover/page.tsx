"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GameOverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = Number(searchParams.get("score") || "0");

  const [highScore, setHighScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);

  useEffect(() => {
    const stored = Number(localStorage.getItem("highScore") || "0");
    if (score > stored) {
      localStorage.setItem("highScore", String(score));
      setHighScore(score);
      setIsNewHigh(true);
    } else {
      setHighScore(stored);
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-gradient-to-br from-red-800 via-purple-700 to-blue-900">

      <h1 className="text-4xl font-bold mb-4">🎮 Game Over</h1>
      <p className="text-xl mb-2">Your Score: {score}</p>
      <p className="text-lg mb-4">High Score: {highScore}</p>

      {isNewHigh ? (
        <p className="text-yellow-300 text-xl font-semibold mb-4">
          🎉 Congratulations! You've set the score high!
        </p>
      ) : (
        <p className="text-gray-200 text-md mb-4">Try again to beat the high score!</p>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/game")}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded text-black font-medium"
        >
          Play Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="bg-white hover:bg-gray-200 px-4 py-2 rounded text-black font-medium"
        >
          Go to First Page
        </button>
      </div>
    </div>
  );
}




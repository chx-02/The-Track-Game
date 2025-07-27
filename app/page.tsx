export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-6">🎮 Track your way</h1>
      <p className="text-xl mb-8">Can you beat the high score?</p>
      <a
        href="/game"
        className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition"
      >
        ▶️ Play Now
      </a>
    </main>
  );
}

export default function Dashboard() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-linear-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
            Dashboard
          </span>
          <br />
          <span className="text-neutral-400">Coming Soon</span>
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-neutral-400 text-base md:text-lg">
          We're building a powerful dashboard experience to help you manage
          everything in one place. Stay tuned.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-5 py-2 text-sm text-neutral-300">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          In active development
        </div>
      </div>
    </div>
  );
}

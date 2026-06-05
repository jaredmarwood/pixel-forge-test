import { useEffect, useState, useRef, useCallback } from "react";

// ─── Game Config ───────────────────────────────────────────────────
const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 32;
const INIT_ENEMY_SIZE = 16;
const INIT_ENEMY_COUNT = 3;
const INIT_SPAWN_RATE = 1800; // ms between enemy spawns
const DIFFICULTY_INTERVAL = 8000; // every 8s difficulty ramps
const BASE_SPEED = 80; // pixels per second

type Point = { x: number; y: number };
type Enemy = { id: number; x: number; y: number; vx: number; vy: number; size: number; color: string };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };
type GameState = "idle" | "playing" | "gameover";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

// ─── Main Component ────────────────────────────────────────────────
export function Game() {
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem("pixeldodge_highscore") ?? 0); } catch { return 0; }
  });
  const [playerPos, setPlayerPos] = useState<Point>({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [level, setLevel] = useState(1);
  const [shake, setShake] = useState(false);
  const [lastTime, setLastTime] = useState(Date.now());
  const [touchPos, setTouchPos] = useState<Point | null>(null);

  const enemyIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const difficultyTimerRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const playerRef = useRef<Point>({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2 });
  const stateRef = useRef<GameState>("idle");

  // Keep refs in sync
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { playerRef.current = playerPos; }, [playerPos]);

  const spawnEnemy = useCallback((w: number, h: number): Enemy => {
    const size = INIT_ENEMY_SIZE + Math.random() * 8;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    switch (side) {
      case 0: x = Math.random() * w; y = -size; break;
      case 1: x = w + size; y = Math.random() * h; break;
      case 2: x = Math.random() * w; y = h + size; break;
      default: x = -size; y = Math.random() * h; break;
    }
    const targetX = Math.random() * w;
    const targetY = Math.random() * h;
    const angle = Math.atan2(targetY - y, targetX - x);
    const speed = BASE_SPEED + levelRef.current * 10 + Math.random() * 20;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#3b82f6";
    return {
      id: enemyIdRef.current++,
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size, color,
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number): Particle[] => {
    const result: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 60 + Math.random() * 120;
      result.push({
        id: particleIdRef.current++,
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.6, maxLife: 0.4 + Math.random() * 0.6,
        color, size: 2 + Math.random() * 4,
      });
    }
    return result;
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    levelRef.current = 1;
    difficultyTimerRef.current = 0;
    lastSpawnRef.current = 0;
    const initPlayer: Point = { x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2 };
    playerRef.current = initPlayer;
    setPlayerPos(initPlayer);
    setScore(0);
    setLevel(1);
    setEnemies([]);
    setParticles([]);
    enemiesRef.current = [];
    particlesRef.current = [];
    setLastTime(Date.now());
    setState("playing");
  }, []);

  const endGame = useCallback(() => {
    setState("gameover");
    setShake(true);
    setTimeout(() => setShake(false), 300);
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      try { localStorage.setItem("pixeldodge_highscore", String(scoreRef.current)); } catch { /* noop */ }
    }
  }, [highScore]);

  // ─── Input Handling ──────────────────────────────────────────────
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current !== "playing") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX - PLAYER_SIZE / 2;
    const y = (e.clientY - rect.top) * scaleY - PLAYER_SIZE / 2;
    const clamped: Point = {
      x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, x)),
      y: Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, y)),
    };
    playerRef.current = clamped;
    setPlayerPos(clamped);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (stateRef.current !== "playing") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const x = (e.touches[0].clientX - rect.left) * scaleX - PLAYER_SIZE / 2;
    const y = (e.touches[0].clientY - rect.top) * scaleY - PLAYER_SIZE / 2;
    const clamped: Point = {
      x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, x)),
      y: Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, y)),
    };
    playerRef.current = clamped;
    setPlayerPos(clamped);
  }, []);

  // ─── Game Loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "playing") return;

    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      setLastTime(now);

      const player = playerRef.current;
      let currentEnemies = [...enemiesRef.current];
      let currentParticles = [...particlesRef.current];

      // Spawn enemies
      const spawnRate = Math.max(400, INIT_SPAWN_RATE - levelRef.current * 150);
      if (now - lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = now;
        currentEnemies.push(spawnEnemy(GAME_WIDTH, GAME_HEIGHT));
      }

      // Difficulty ramp
      difficultyTimerRef.current += dt;
      if (difficultyTimerRef.current > DIFFICULTY_INTERVAL) {
        difficultyTimerRef.current = 0;
        levelRef.current += 1;
        setLevel(levelRef.current);
      }

      // Update enemies
      const remaining: Enemy[] = [];
      for (const e of currentEnemies) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        // Remove if off screen far enough
        if (e.x > -100 && e.x < GAME_WIDTH + 100 && e.y > -100 && e.y < GAME_HEIGHT + 100) {
          remaining.push(e);
        }
      }

      // Collision detection
      let hit = false;
      for (const e of remaining) {
        const dx = (player.x + PLAYER_SIZE / 2) - (e.x + e.size / 2);
        const dy = (player.y + PLAYER_SIZE / 2) - (e.y + e.size / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (PLAYER_SIZE + e.size) / 2.5) {
          hit = true;
          // Explosion particles
          currentParticles.push(...spawnParticles(e.x + e.size / 2, e.y + e.size / 2, e.color, 8));
          break;
        }
      }

      if (hit) {
        enemiesRef.current = remaining;
        setEnemies(remaining);
        particlesRef.current = currentParticles;
        setParticles(currentParticles);
        endGame();
        return;
      }

      // Score increment based on survival
      scoreRef.current += Math.floor(dt * (10 + levelRef.current * 5));
      setScore(scoreRef.current);

      // Update particles
      currentParticles = currentParticles
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life - dt,
        }))
        .filter(p => p.life > 0);

      enemiesRef.current = remaining;
      particlesRef.current = currentParticles;
      setEnemies(remaining);
      setParticles(currentParticles);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [state, lastTime, spawnEnemy, spawnParticles, endGame]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: GAME_WIDTH, fontSize: "0.85rem", color: "#94a3b8" }}>
        <span>PIXEL DODGE</span>
        <span>Level {level}</span>
      </div>

      {/* Score */}
      <div style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "monospace", color: "#e2e8f0", letterSpacing: "-0.02em" }}>
        {score.toString().padStart(6, "0")}
        <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#64748b", marginLeft: "0.75rem" }}>
          hi {highScore.toString().padStart(6, "0")}
        </span>
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: GAME_WIDTH,
          aspectRatio: "1",
          background: "#0f172a",
          border: "2px solid #1e293b",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: state === "playing" ? "none" : "pointer",
          transform: shake ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` : "none",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />

        {state === "playing" && (
          <>
            {/* Enemies */}
            {enemies.map(e => (
              <div key={e.id} style={{
                position: "absolute",
                left: e.x, top: e.y,
                width: e.size, height: e.size,
                background: e.color,
                borderRadius: "3px",
                boxShadow: `0 0 ${e.size / 2}px ${e.color}40`,
                transition: "none",
              }} />
            ))}

            {/* Player */}
            <div style={{
              position: "absolute",
              left: playerPos.x, top: playerPos.y,
              width: PLAYER_SIZE, height: PLAYER_SIZE,
              background: "#3b82f6",
              borderRadius: "50%",
              boxShadow: "0 0 16px #3b82f6aa",
            }}>
              <div style={{
                position: "absolute", inset: "4px",
                background: "#93c5fd",
                borderRadius: "50%",
              }} />
            </div>

            {/* Particles */}
            {particles.map(p => (
              <div key={p.id} style={{
                position: "absolute",
                left: p.x, top: p.y,
                width: p.size * (p.life / p.maxLife),
                height: p.size * (p.life / p.maxLife),
                background: p.color,
                borderRadius: "50%",
                opacity: p.life / p.maxLife,
              }} />
            ))}
          </>
        )}

        {/* Idle overlay */}
        {state === "idle" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "1.5rem",
          }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Pixel Dodge</h2>
            <p style={{ color: "#64748b", margin: 0, textAlign: "center", maxWidth: "260px", lineHeight: 1.5 }}>
              Dodge the falling shapes.<br />Move your finger or mouse.
            </p>
            <button
              onClick={startGame}
              style={{
                padding: "0.8rem 2.5rem",
                fontSize: "1.1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px #3b82f644",
              }}
              onPointerDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
              onPointerUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              PLAY
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {state === "gameover" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(15,23,42,0.92)",
            gap: "1rem",
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444", margin: 0 }}>GAME OVER</h2>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "monospace", color: "#e2e8f0" }}>
              {score.toString().padStart(6, "0")}
            </div>
            {score >= highScore && score > 0 && (
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308" }}>★ NEW HIGH SCORE ★</div>
            )}
            <button
              onClick={startGame}
              style={{
                padding: "0.6rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              PLAY AGAIN
            </button>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
              Level {level} reached
            </div>
          </div>
        )}
      </div>

      {/* Mobile hint */}
      <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0, textAlign: "center" }}>
        Touch & drag to move • Mouse to play
      </p>
    </div>
  );
}

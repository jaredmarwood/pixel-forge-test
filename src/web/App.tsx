import { useState } from "react";
import { Game } from "./Game";

export function App() {
  const [activeTab, setActiveTab] = useState<"game" | "about">("game");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      color: "#f1f5f9",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem", maxWidth: "960px", margin: "0 auto",
      }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: "#3b82f6" }}>Pixel</span>
          <span style={{ color: "#8b5cf6" }}>Dodge</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["game", "about"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.4rem 1.2rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: activeTab === tab ? "rgba(59,130,246,0.15)" : "transparent",
                color: activeTab === tab ? "#3b82f6" : "#64748b",
                border: activeTab === tab ? "1px solid #3b82f644" : "1px solid transparent",
                borderRadius: "6px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "game" ? (
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1rem 3rem" }}>
          <Game />
        </div>
      ) : (
        <div style={{
          maxWidth: "640px", margin: "0 auto", padding: "2rem 1rem 4rem",
          display: "flex", flexDirection: "column", gap: "1.5rem",
        }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              A tiny game.<br />
              <span style={{ color: "#3b82f6" }}>Big reflexes.</span>
            </h1>
          </div>
          <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "1.05rem" }}>
            Dodge the shapes. Survive as long as you can. Every level brings more
            enemies, faster speeds, and tighter spaces. How high can your score go?
          </p>
          <div style={{
            padding: "1.5rem", background: "#1e293b", borderRadius: "12px",
            border: "1px solid #334155",
          }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>How to play</h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", lineHeight: 1.6 }}>
              <li><strong style={{ color: "#cbd5e1" }}>Move</strong> — Drag your finger or move your mouse to control the blue orb.</li>
              <li><strong style={{ color: "#cbd5e1" }}>Dodge</strong> — Colored shapes rain down from every direction.</li>
              <li><strong style={{ color: "#cbd5e1" }}>Score</strong> — The longer you survive, the higher your score.</li>
              <li><strong style={{ color: "#cbd5e1" }}>Level up</strong> — Every 8 seconds, enemies get faster and more numerous.</li>
              <li><strong style={{ color: "#cbd5e1" }}>High score</strong> — Your best score is saved locally.</li>
            </ul>
          </div>
          <div style={{
            padding: "1.5rem", background: "#1e293b", borderRadius: "12px",
            border: "1px solid #334155",
          }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>About</h3>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
              Built by <strong style={{ color: "#cbd5e1" }}>Pixel Forge</strong> as a test project.
              Crafted with React, TypeScript, and a healthy obsession with arcade games.
              Fully playable in your browser — no downloads, no sign-ups.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "2rem", color: "#475569", fontSize: "0.8rem",
        borderTop: "1px solid #1e293b", marginTop: "auto",
      }}>
        Pixel Dodge — A Pixel Forge project. Built with React + Vite.
      </footer>
    </div>
  );
}

import type { CSSProperties } from "react"

import explosionBurst from "@/assets/bomb/explosion-burst.png"

export type ExplosionOrigin = {
  x: number
  y: number
}

type ExplosionOverlayProps = {
  origin: ExplosionOrigin
}

type ExplosionOverlayStyle = CSSProperties & {
  "--explosion-x": string
  "--explosion-y": string
}

type ExplosionParticleStyle = CSSProperties & {
  "--particle-color": string
  "--particle-delay": string
  "--particle-rotate": string
  "--particle-size": string
  "--particle-x": string
  "--particle-y": string
}

const particles = [
  { x: -112, y: -78, rotate: -42, delay: 0, size: 10, color: "#facc15", shape: "round" },
  { x: -38, y: -126, rotate: -18, delay: 18, size: 13, color: "#f59e0b", shape: "spark" },
  { x: 48, y: -116, rotate: 24, delay: 8, size: 9, color: "#fb923c", shape: "round" },
  { x: 118, y: -62, rotate: 52, delay: 35, size: 14, color: "#facc15", shape: "spark" },
  { x: 128, y: 38, rotate: 78, delay: 15, size: 9, color: "#ef4444", shape: "round" },
  { x: 62, y: 108, rotate: 118, delay: 48, size: 12, color: "#f59e0b", shape: "spark" },
  { x: -34, y: 122, rotate: -110, delay: 26, size: 8, color: "#facc15", shape: "round" },
  { x: -116, y: 58, rotate: -72, delay: 58, size: 13, color: "#fb923c", shape: "spark" },
  { x: 2, y: -94, rotate: 8, delay: 42, size: 7, color: "#ef4444", shape: "round" },
] as const

export function ExplosionOverlay({ origin }: ExplosionOverlayProps) {
  const overlayStyle: ExplosionOverlayStyle = {
    "--explosion-x": `${origin.x}px`,
    "--explosion-y": `${origin.y}px`,
  }

  return (
    <div aria-hidden="true" className="explosion-screen" style={overlayStyle}>
      <span className="explosion-flash" />
      <span className="explosion-ambient" />
      <span className="soft-glow soft-glow--celebration explosion-centered" />
      <span className="explosion-wave explosion-centered" />
      <img alt="" className="explosion-burst explosion-centered" src={explosionBurst} />
      {particles.map((particle) => {
        const particleStyle: ExplosionParticleStyle = {
          "--particle-color": particle.color,
          "--particle-delay": `${particle.delay}ms`,
          "--particle-rotate": `${particle.rotate}deg`,
          "--particle-size": `${particle.size}px`,
          "--particle-x": `${particle.x}px`,
          "--particle-y": `${particle.y}px`,
        }

        return (
          <span
            key={`${particle.x}-${particle.y}`}
            className={`explosion-particle explosion-particle--${particle.shape}`}
            style={particleStyle}
          />
        )
      })}
    </div>
  )
}

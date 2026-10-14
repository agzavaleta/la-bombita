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
  { x: -205, y: -130, rotate: -48, delay: 0, size: 18, color: "#facc15", shape: "spark" },
  { x: -112, y: -205, rotate: -24, delay: 70, size: 13, color: "#f59e0b", shape: "round" },
  { x: -20, y: -242, rotate: -5, delay: 30, size: 21, color: "#fb923c", shape: "spark" },
  { x: 86, y: -218, rotate: 22, delay: 120, size: 12, color: "#facc15", shape: "round" },
  { x: 188, y: -142, rotate: 48, delay: 50, size: 20, color: "#f59e0b", shape: "spark" },
  { x: 238, y: -52, rotate: 72, delay: 170, size: 14, color: "#ef4444", shape: "round" },
  { x: 232, y: 82, rotate: 98, delay: 20, size: 22, color: "#facc15", shape: "spark" },
  { x: 148, y: 188, rotate: 126, delay: 100, size: 11, color: "#fb923c", shape: "round" },
  { x: 42, y: 236, rotate: 164, delay: 60, size: 19, color: "#f59e0b", shape: "spark" },
  { x: -78, y: 226, rotate: -158, delay: 215, size: 13, color: "#ef4444", shape: "round" },
  { x: -182, y: 164, rotate: -128, delay: 80, size: 21, color: "#facc15", shape: "spark" },
  { x: -244, y: 48, rotate: -96, delay: 145, size: 12, color: "#f59e0b", shape: "round" },
  { x: -232, y: -64, rotate: -72, delay: 40, size: 17, color: "#fb923c", shape: "spark" },
  { x: 156, y: 48, rotate: 84, delay: 130, size: 10, color: "#facc15", shape: "round" },
  { x: -132, y: 72, rotate: -106, delay: 190, size: 16, color: "#ef4444", shape: "spark" },
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
      <span className="explosion-wave explosion-wave--primary explosion-centered" />
      <span className="explosion-wave explosion-wave--secondary explosion-centered" />
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

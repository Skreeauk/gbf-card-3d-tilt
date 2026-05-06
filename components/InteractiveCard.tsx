"use client"

import React, { useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useAnimationControls,
} from "motion/react"
import { cn } from "@/lib/utils"

const BOX_SHADOW =
  "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px"

const FLIP_TRANSITION = {
  duration: 0.55,
  type: "spring" as const,
  stiffness: 200,
  damping: 22,
}

function useFace(
  rotateDepth: number,
  translateDepth: number,
  enabled: boolean
) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })

  const tiltX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`]
  )
  const tiltY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`]
  )
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`]
  )
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`]
  )
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.9) 10%, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0) 80%)`

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !enabled) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return {
    ref,
    tiltX,
    tiltY,
    translateX,
    translateY,
    glareBackground,
    onMouseMove,
    onMouseLeave,
  }
}

export const InteractiveCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  className,
  children,
  backContent,
  isFlipped: externalIsFlipped,
  onFlip,
}: {
  rotateDepth?: number
  translateDepth?: number
  className?: string
  children: React.ReactNode
  backContent?: React.ReactNode
  isFlipped?: boolean
  onFlip?: () => void
}) => {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false)
  const isFlipped =
    externalIsFlipped !== undefined ? externalIsFlipped : internalIsFlipped

  const front = useFace(rotateDepth, translateDepth, !isFlipped)
  const back = useFace(rotateDepth, translateDepth, isFlipped)

  // Separate flip motion values so they don't fight tilt
  const frontFlipY = useMotionValue(0)
  const backFlipY = useMotionValue(180)
  const frontFlipSpring = useSpring(frontFlipY, { stiffness: 200, damping: 22 })
  const backFlipSpring = useSpring(backFlipY, { stiffness: 200, damping: 22 })

  // Drive the flip springs when isFlipped changes
  React.useEffect(() => {
    frontFlipY.set(isFlipped ? -180 : 0)
    backFlipY.set(isFlipped ? 0 : 180)
  }, [isFlipped, frontFlipY, backFlipY])

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1000px" }}
    >
      {/* ── Front face ── */}
      <motion.div
        ref={front.ref}
        onMouseMove={front.onMouseMove}
        onMouseLeave={front.onMouseLeave}
        style={{
          rotateX: front.tiltX,
          rotateY: frontFlipSpring, // flip drives rotateY; tilt is on X only
          translateX: front.translateX,
          translateY: front.translateY,
          transformStyle: "preserve-3d",
          boxShadow: BOX_SHADOW,
          pointerEvents: isFlipped ? "none" : "auto",
        }}
        animate={{ opacity: isFlipped ? 0 : 1 }}
        transition={{ opacity: { duration: 0.2 } }}
        whileHover={
          !isFlipped
            ? { scale: 1.05, z: 50, transition: { duration: 0.2 } }
            : {}
        }
        className="relative rounded-2xl"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-[16px] mix-blend-overlay"
          style={{ background: front.glareBackground, opacity: 0.6 }}
        />
      </motion.div>

      {/* ── Back face ── */}
      {backContent && (
        <motion.div
          ref={back.ref}
          onMouseMove={back.onMouseMove}
          onMouseLeave={back.onMouseLeave}
          style={{
            rotateX: back.tiltX,
            rotateY: backFlipSpring, // flip drives rotateY; tilt is on X only
            translateX: back.translateX,
            translateY: back.translateY,
            transformStyle: "preserve-3d",
            boxShadow: BOX_SHADOW,
            position: "absolute",
            inset: 0,
            pointerEvents: isFlipped ? "auto" : "none",
          }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ opacity: { duration: 0.2 } }}
          whileHover={
            isFlipped
              ? { scale: 1.05, z: 50, transition: { duration: 0.2 } }
              : {}
          }
          className="rounded-2xl"
        >
          {backContent}
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-[16px] mix-blend-overlay"
            style={{ background: back.glareBackground, opacity: 0.6 }}
          />
        </motion.div>
      )}
    </div>
  )
}

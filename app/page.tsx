"use client"

import { useRef, useState, useEffect } from "react"

import Image from "next/image"

import { Button } from "@/components/ui/button"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { InteractiveCard } from "@/components/InteractiveCard"
import { ModeToggle } from "@/components/ModeToggle"

export default function Page() {
  const [uploadedFrontImage, setUploadedFrontImage] = useState<string | null>(
    null
  )
  const [uploadedBackImage, setUploadedBackImage] = useState<string | null>(
    null
  )
  const [isFlipped, setIsFlipped] = useState(false)

  const frontFileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    return (
      target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    )
  }

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedFrontImage) URL.revokeObjectURL(uploadedFrontImage)
      if (uploadedBackImage) URL.revokeObjectURL(uploadedBackImage)
    }
  }, [uploadedFrontImage, uploadedBackImage])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "r") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setIsFlipped((prev) => !prev)
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const handleUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = event.target.files?.[0]
    // Reset input so same file can be re-selected
    event.target.value = ""

    if (!file) return

    if (!file.type.startsWith("image/")) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    setter(URL.createObjectURL(file))
  }

  const backContent = (
    <div
      onClick={(e) => {
        e.stopPropagation()
        backFileInputRef.current?.click()
      }}
      className="group relative flex w-80 cursor-pointer flex-col items-stretch border-0 bg-[#1F2121]"
      style={{ transformStyle: "preserve-3d", transform: "none", opacity: 1 }}
    >
      <div className="flex-1">
        <div className="relative aspect-3/4 w-full">
          <Image
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
            alt="Back of Profile Card"
            src={uploadedBackImage || "/back.png"}
            width={675}
            height={900}
            unoptimized={!!uploadedBackImage}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full flex-col items-center justify-center gap-6 text-sm leading-loose">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          GBF Profile Card 3D Tilt
        </h1>
        <div className="flex items-center justify-center gap-6">
          <KbdGroup>
            <Kbd>D</Kbd>
          </KbdGroup>
          <span>or</span>
          <ModeToggle />
          <span>|</span>
          <div className="flex items-center justify-center gap-4">
            <KbdGroup>
              <Kbd>R</Kbd>
            </KbdGroup>
            <span>to rotate</span>
          </div>
        </div>
        <span className="mb-10 scroll-m-20 text-xl font-semibold tracking-tight">
          Click the card to upload an image front and back. The aspect ratio is
          3:4.
        </span>

        <input
          ref={frontFileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, setUploadedFrontImage)}
          className="hidden"
        />
        <input
          ref={backFileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, setUploadedBackImage)}
          className="hidden"
        />

        <InteractiveCard
          backContent={backContent}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
              frontFileInputRef.current?.click()
            }}
            className="group relative flex w-80 cursor-pointer flex-col items-stretch border-0 bg-[#1F2121]"
            style={{
              transformStyle: "preserve-3d",
              transform: "none",
              opacity: 1,
            }}
          >
            <div className="flex-1">
              <div className="relative aspect-3/4 w-full">
                <Image
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                  alt="Profile Card"
                  src={uploadedFrontImage || "/profilecard.png"}
                  width={675}
                  height={900}
                  unoptimized={!!uploadedFrontImage}
                />
              </div>
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  )
}

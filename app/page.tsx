"use client"

import { useRef, useState, useEffect } from "react"

import Image from "next/image"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { InteractiveCard } from "@/components/InteractiveCard"
import { ModeToggle } from "@/components/ModeToggle"

export default function Page() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage)
      }
    }
  }, [uploadedImage])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)")
      return
    }

    // Optional: Add file size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    // Create a temporary local URL for the image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full flex-col items-center justify-center gap-8 text-sm leading-loose">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          GBF Profile Card 3D Tilt
        </h1>
        <div className="flex items-center justify-center gap-6">
          <KbdGroup>
            <Kbd>D</Kbd>
          </KbdGroup>
          <span>or</span>
          <ModeToggle />
        </div>
        <span className="scroll-m-20 text-xl font-semibold tracking-tight">
          Click on the card to upload your own profile card image
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-500 dark:bg-red-900/20">
            {error}
          </div>
        )}

        <InteractiveCard>
          <div
            onClick={handleButtonClick}
            className="flex w-80 cursor-pointer flex-col items-stretch border-0 bg-[#1F2121]"
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
                  src={uploadedImage || "/profilecard.png"}
                  width={675}
                  height={900}
                  unoptimized={!!uploadedImage}
                />
              </div>
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  )
}

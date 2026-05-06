"use client"

/* eslint-disable */

import { useState, useEffect } from "react"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

export function ModeToggle({ className }: { className?: string }) {
	const [mounted, setMounted] = useState(false)
	const { resolvedTheme, setTheme } = useTheme()

	// useEffect only runs on the client, so now we can safely show the UI
	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn("p-2 hover:bg-transparent", className)}
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
			aria-label="Toggle Light / Dark mode"
		>
			{resolvedTheme === "dark" ? (
				<MoonIcon className="size-6 text-primary" />
			) : (
				<SunIcon className="size-6 text-primary" />
			)}
		</Button>
	)
}

"use client"

import { useTheme } from "@/lib/theme/ThemeProvider"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const icon = theme === "system" ? "🖥️" : resolvedTheme === "dark" ? "🌙" : "☀️"
  const label = theme === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light"

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Current: ${label} mode (click to cycle)`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </motion.button>
  )
}

export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const icon = theme === "system" ? "🖥️" : resolvedTheme === "dark" ? "🌙" : "☀️"

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Switch theme (current: ${
        theme === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light"
      })`}
    >
      <span className="text-xl">{icon}</span>
    </motion.button>
  )
}

import { useEffect, useMemo, useRef, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = () => {
  const mediaQuery = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)"),
    []
  );

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("themeMode") || "system";
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
    return mediaQuery.matches ? "dark" : "light";
  });

  const modeRef = useRef(mode);

  // Keep ref in sync with latest mode
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Handle mode changes + persist
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    if (mode === "system") {
      setTheme(mediaQuery.matches ? "dark" : "light");
    } else {
      setTheme(mode);
    }
  }, [mode, mediaQuery]);

  // System listener — registered once, reads mode via ref
  useEffect(() => {
    const handleChange = (e) => {
      if (modeRef.current === "system") {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mediaQuery]);

  const toggleTheme = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (mode === "system") {
      setMode(theme === "dark" ? "light" : "dark");
    } else {
      setMode((prev) => (prev === "dark" ? "light" : "dark"));
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium
        text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
        transition-all duration-150"
    >
      {theme === "dark" ? (
        <FiSun className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      ) : (
        <FiMoon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      )}
      <span>
        {mode === "system"
          ? `System (${theme === "dark" ? "Dark" : "Light"})`
          : theme === "dark"
          ? "Light Mode"
          : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;
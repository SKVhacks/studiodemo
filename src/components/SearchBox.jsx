import { useState, useEffect, useRef, useCallback } from "react";
import { IoSearch } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
export default function SearchBox({
  placeholders = [""],
  value = "",
  onChange,
  onSearch,
  onClear,
  className = "",
  inputRef: externalRef,
  autoFocus = false,
}) {
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;

  // ── Typing animation state ──────────────────────────────────────────────
  const [wordIndex, setWordIndex]   = useState(0);
  const [charIndex, setCharIndex]   = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // ── Focus state for ring ────────────────────────────────────────────────
  const [isFocused, setIsFocused] = useState(false);

  // ── Typing animation loop ───────────────────────────────────────────────
  useEffect(() => {
    if (placeholders.length === 0) return;

    const currentWord = `${placeholders[wordIndex]}`;
    const typingSpeed  = isDeleting ? 45 : 90;
    const pauseAtEnd   = 1800;
    const pauseAtStart = 400;

    let timeout;

    if (!isDeleting && charIndex === currentWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseAtEnd);
    } else if (isDeleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % placeholders.length);
      }, pauseAtStart);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, charIndex + (isDeleting ? -1 : 1)));
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, placeholders]);

  // ── Keyboard shortcut ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [inputRef]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.(value);
    if (e.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  };

  const handleClear = useCallback(() => {
    onChange?.("");
    onClear?.();
    inputRef.current?.focus();
  }, [onChange, onClear, inputRef]);

  const showClear = value.length > 0;

  return (
    <div className={`relative w-full md:max-w-md ${className}`}>

      {/* ── Search icon (inline SVG — no react-icons dependency) ── */}
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 transition-colors duration-200 z-10">
        <IoSearch  className="text-xl"/>
      </span>

      {/* ── Animated placeholder (only when no value typed) ── */}
      {!value && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-zinc-500 select-none whitespace-nowrap overflow-hidden z-10"
          style={{ lineHeight: "normal" }}
        >
          Search by {displayText}
          {/* Blinking cursor */}
          <span
            style={{
              display: "inline-block",
              width: "1px",
              height: "0.875em",
              backgroundColor: "currentColor",
              marginLeft: "1px",
              verticalAlign: "middle",
              animation: "sbBlink 1s step-end infinite",
            }}
          />
        </span>
      )}

      {/* ── Input ── */}
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        value={value}
        placeholder=""
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full py-2.5 pl-10 text-sm rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border ${isFocused ? "border-gray-400/60 dark:border-white/25" : "border-gray-200 dark:border-white/10"}
          text-black dark:text-white placeholder-transparent transition-all duration-200 ease-in-out  ${isFocused ? "focus:outline-none focus:ring-2 focus:ring-focus border-none": ""} `}
      />

      {/* ── Right-side controls ── */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">

        {/* Clear button — inline SVG circle-x */}
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex items-center justify-center rounded-full text-red-500 hover:opacity-75 text-2xl transition-all duration-150 ease-in-out"
          >
            <MdOutlineCancel/>
          </button>
        )}

      </span>

      {/* ── Blink keyframe ── */}
      <style>{`
        @keyframes sbBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}
      </style>
    </div>
  );
}
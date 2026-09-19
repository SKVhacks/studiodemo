import { IoWarningOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ConflictAlert({ message, onConfirm, onCancel, conflictDate }) {
  const navigate = useNavigate();
  if (!message) return null;

  // Extract date from conflictDate prop or parse from message as fallback
  // conflictDate should be passed as "YYYY-MM-DD" string
  const handleViewEvents = () => {
    onCancel(); // close the alert first
    navigate(`/events?date=${conflictDate}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="
        relative w-full max-w-md
        rounded-2xl
        bg-white/70 dark:bg-zinc-900/70
        backdrop-blur-xl
        border border-gray-200/60 dark:border-white/10
        shadow-xl p-6
        animate-[fadeIn_.2s_ease]
      ">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100/60 dark:bg-red-400/10 flex items-center justify-center">
            <span className=""><IoWarningOutline className="text-red-500 text-3xl" /></span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white">
          Scheduling Conflict
        </h3>

        {/* Message */}
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </p>

        <p className="text-center text-xs mt-2 text-gray-400 dark:text-gray-500">
          Do you still want to save this event?
        </p>
        {conflictDate && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleViewEvents}
              className="
                flex items-center gap-1.5 text-xs font-medium
                text-blue-500 dark:text-blue-400
                hover:text-blue-700 dark:hover:text-blue-300
                underline underline-offset-2 transition-colors
              "
            >
              See all events on {conflictDate}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white hover:scale-105 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl hover:scale-105 bg-amber-500/90 text-white hover:bg-amber-500 transition shadow-sm"
          >
            Save Anyway
          </button>
        </div>

      </div>
    </div>
  );
}
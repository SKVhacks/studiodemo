import React , {useEffect , useState , useRef} from "react";

// Password strength calculator
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  if (score >= 4) return { score: 5, label: "Strong", color: "bg-lime-500" };
}


// Eye Icon
function EyeIcon ({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}


// Password strength meter
export const PasswordStrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const bars = 5;
  return (
    <div className="space-y-1 mt-3">
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? strength.color : "bg-base-300"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength.label === "Weak" ? "text-rose-500" :
        strength.label === "Fair" ? "text-amber-500" :
        strength.label === "Good" ? "text-blue-500" : "text-lime-500"
      }`}>
        {strength.label} password
      </p>
    </div>
  );
}

// Password input with eye toggle
export const  PasswordInput = ({ value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="w-full px-4 py-2 rounded-xl mt-2
            bg-white/10 text-white
              border border-white/20 focus:ring-2 focus:ring-focusl outline-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      <button
        type="button"
        tabIndex={-1}
        className="text-white/80 absolute inset-y-0 right-0 flex items-center px-3  hover:text-white transition-colors mt-2"
        onClick={() => setShow((s) => !s)}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}


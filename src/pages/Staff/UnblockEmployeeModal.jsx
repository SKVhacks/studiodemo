import { useState } from "react";
import { RequestUnblock, ConfirmUnblock } from "../../api/EmployeeServices";

function UnblockEmployeeModal({ employee, onClose, showToast }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      await RequestUnblock(employee.id);
      setSent(true);
      showToast("OTP sent to admin email", "alert-success");
    } catch {
      showToast("Failed to send OTP", "alert-error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      showToast("Enter valid OTP", "alert-warning");
      return;
    }

    try {
      setLoading(true);
      await ConfirmUnblock(employee.id, code);
      showToast("Employee Unblocked", "alert-success");
      onClose();
    } catch {
      showToast("Invalid OTP", "alert-error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="
      relative w-full max-w-sm
      rounded-3xl p-6 text-center
      bg-white/60 dark:bg-zinc-900/80
      backdrop-blur-2xl
      border border-white/20
      shadow-[0_25px_80px_rgba(0,0,0,0.25)]
    "
        onClick={(e) => e.stopPropagation()}
      >

        {/* TITLE */}
        <h3 className="text-lg font-semibold mb-5">
          Unblock {employee.full_name}
        </h3>

        {!sent ? (
          <div className="flex flex-row justify-center gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={sendOtp}
              disabled={loading}
              className={` ${loading ? "opacity-60" : ""}
          px-5 py-2 rounded-xl text-sm text-white  bg-submit  hover:scale-110 transition font-medium `}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

          </div>
        ) : (
          <>
            {/* OTP INPUTS */}
            <div className="flex justify-center gap-2 sm:gap-3 my-5">

              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  className="
                w-10 h-12 sm:w-12 sm:h-14
                text-center text-lg font-semibold
                rounded-xl
                bg-white/80 dark:bg-white/10
                border border-white/20
                outline-none
                focus:ring-2 focus:ring-focus
                transition
              "
                />
              ))}

            </div>

            {/* VERIFY BUTTON */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium hover:scale-105 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                disabled={loading}
                className={` ${loading ? "opacity-60" : ""}px-5 py-2 rounded-xl text-sm text-white  bg-submit  hover:scale-110 transition font-medium disabled:cursor-not-allowed`}
              >
                {loading ? "Verifying..." : "Confirm Unblock"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UnblockEmployeeModal;
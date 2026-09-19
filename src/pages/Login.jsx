import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getPasswordStrength,
  PasswordStrengthMeter,
  PasswordInput,
} from "../helpers/LoginHelper";
import { stepConfig } from "../helpers/data";
import {
  checkmail,
  loginWithPass,
  verifyotp,
  requestOtpForgot,
  verifyOtpForgot,
  setPasswordAPI,
} from "../api/LoginService";
import Antigravity from "../components/Antigravity";

// 6-box OTP input
function OtpInput({ value, onChange }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const newOtp = digits.map((d, i) => (i === index ? val : d)).join("");
    onChange(newOtp);
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6).replace(/ /g, ""));
    if (pasted.length > 0) {
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={`w-11 text-white h-14 text-center text-xl font-bold  transition-all rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-focusl outline-none
            ${digit ? "border-white/10 bg-white/5" : ""}`}
        />
      ))}
    </div>
  );
}

function Login() {
  const [toast, setToast] = useState(null);
  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 5000);
  };
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("admin@gadgetvishwa.in");
  const [password, setPassword] = useState("Password@123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSessionToken, setOtpSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleError = (err) => {
    const data = err.response.data;
    if (data?.error) showToast(data.error, "alert-error");
    else if (data[0]) showToast(data[0], "alert-error");
    else showToast("Something went wrong. Please try again.", "alert-error");
  };

  const checkEmail = async () => {
    if (!email) {
      showToast("Please enter your email.", "alert-error");
      return;
    }
    setLoading(true);
    try {
      const res = await checkmail(email);
      if (res.data.login_type === "PASSWORD_LOGIN") {
        setStep("PASSWORD");
      } else {
        await API.post("/auth/request-otp/", { email });
        setStep("OTP");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async () => {
    if (!password) {
      showToast("Please enter your password.", "alert-error");
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithPass(email, password);
      login(
        res.data.access,
        res.data.refresh,
        res.data.role,
        res.data.Id,
        res.data.name,
        res.data.Gmail,
      );
      navigate("/home", {
        state: {
          toast: {
            msg: `Welcome Back ${res.data.name} 👋`,
            color: "alert-welcome",
          },
        },
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      showToast("Please enter the full 6-digit OTP.", "alert-error");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyotp(email, otp);
      setOtpSessionToken(res.data.otp_session_token);
      setStep("SET_PASSWORD");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const requestForgotOtp = async () => {
    if (!email) {
      showToast("Please enter your email first.", "alert-error");
    }
    setLoading(true);
    try {
      await requestOtpForgot(email);
      showToast("OTP Send To Your Gmail", "alert-success");
      setStep("FORGOT_OTP");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotOtp = async () => {
    if (otp.length < 6) {
      showToast("Please enter the full 6-digit OTP.", "alert-error");
    }
    setLoading(true);
    try {
      const res = await verifyOtpForgot(email, otp);
      setOtpSessionToken(res.data.otp_session_token);
      setStep("FORGOT_SET_PASSWORD");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (isForgot = false) => {
    if (!password) {
      showToast("Please enter a password.", "alert-error");
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "alert-error");
    }
    if (getPasswordStrength(password).score < 2) {
      showToast("Please choose a stronger password.", "alert-error");
    }
    setLoading(true);
    try {
      const res = await setPasswordAPI(password, otpSessionToken);
      login(
        res.data.access,
        res.data.refresh,
        res.data.role,
        res.data.Id,
        res.data.name,
        res.data.Gmail,
      );
      navigate("/home");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  const config = stepConfig[step] || stepConfig.EMAIL;
  const [hue, setHue] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHue((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {toast && (
        <div>
          <Toast msg={toast.msg} color={toast.color} />
        </div>
      )}
      <div
        className="min-h-screen flex items-center justify-center px-4 
       transition-colors duration-300 bg-black text-white relative 
        h-screen w-full"
      >
        <div className="absolute inset-0 z-10 ">
          <Antigravity
            count={700}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={0.8}
            lerpSpeed={0.05}
            // color="#fff400"
            color={`hsl(${hue}, 100%, 60%)`}
            autoAnimate
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={5.3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
        <div className="w-full max-w-md bg-transparent z-50">
          {/* Card */}
          <div className=" bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              {/* Logo / Brand mark */}
              <div className="flex justify-center mb-10">
                {/* <img src="" alt="logo" className="h-30 md:h-40 xl:h-50" /> */}
                <h1>your logo here</h1>
              </div>
              {/* Title */}
              
              <div className="text-center  ">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {config.title}
                </h2>
                <p className="text-sm text-white/60">{config.sub}</p>
                {(step === "PASSWORD" ||
                  step === "OTP" ||
                  step === "SET_PASSWORD") && (
                  <p className="text-xs text-white font-medium truncate">
                    {email}
                  </p>
                )}
              </div>

              {/* Step progress dots */}
              <div className="flex justify-center gap-1.5 py-2">
                {[
                  "EMAIL",
                  "PASSWORD",
                  "OTP",
                  "SET_PASSWORD",
                  "FORGOT_OTP",
                  "FORGOT_SET_PASSWORD",
                ]
                  .filter((s) =>
                    step === "EMAIL"
                      ? ["EMAIL"].includes(s)
                      : step === "PASSWORD"
                        ? ["EMAIL", "PASSWORD"].includes(s)
                        : step === "OTP"
                          ? ["EMAIL", "OTP"].includes(s)
                          : step === "SET_PASSWORD"
                            ? ["EMAIL", "OTP", "SET_PASSWORD"].includes(s)
                            : step === "FORGOT_OTP"
                              ? ["EMAIL", "FORGOT_OTP"].includes(s)
                              : [
                                  "EMAIL",
                                  "FORGOT_OTP",
                                  "FORGOT_SET_PASSWORD",
                                ].includes(s),
                  )
                  .map((s, i) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-6 bg-bar" : "w-2 bg-bar/50"}`}
                    />
                  ))}
              </div>
              {/* ── EMAIL STEP ── */}
              {step === "EMAIL" && (
                
                <div className="space-y-4">
                  <div className="mx-8 mb-5 rounded-xl bg-white/10 px-5 py-4 text-center backdrop-blur-md border border-white/10">
                <h1 className="mb-2 text-sm font-medium text-red-500">
                  Use these credentials to login
                </h1>

                <div className="space-y-1 text-md">
                  <p className="text-white/70">
                    <span className="font-semibold text-white">Admin:</span>{" "}
                    <span className="text-white/90">admin@gadgetvishwa.in</span>
                  </p>

                  <p className="text-white/70">
                    <span className="font-semibold text-white">Staff:</span>{" "}
                    <span className="text-white/90">staff@gadgetvishwa.in</span>
                  </p>
                </div>
              </div>
                  <div className="space-y-4">
                    <label className="text-sm text-white font-medium">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="admin@gadgetvishwa.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && checkEmail()}
                      className="w-full px-4 py-2 rounded-xl mt-2 bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-focusl outline-none"
                    />
                  </div>
                  {email.length > 3 &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid email address.
                      </p>
                    )}
                  {email.length > 0 &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <button
                        className={`w-full mt-2 py-3 rounded-xl text-white font-medium
                bg-submit ${loading || !email ? "cursor-not-allowed opacity-70" : "hover:scale-105"}
                 transition`}
                        onClick={checkEmail}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          "Continue"
                        )}
                      </button>
                    )}
                </div>
              )}

              {/* ── PASSWORD STEP ── */}
              {step === "PASSWORD" && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="text-sm font-medium text-white">
                      Password
                    </label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      placeholder="Enter your password"
                      id="login-password"
                    />
                  </div>
                  <button
                    className={`w-full mt-2 py-3 rounded-xl text-white font-medium
                bg-submit ${loading || !password ? "cursor-not-allowed opacity-70" : "hover:scale-105"}
                 transition`}
                    onClick={loginWithPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                  <div className="flex justify-between items-center">
                    <button
                      className="text-gray-300/70"
                      onClick={() => setStep("EMAIL")}
                    >
                      Back
                    </button>
                    <button
                      className="text-xs text-red-500 normal-case hover:scale-103 transition-all"
                      onClick={requestForgotOtp}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              )}

              {/* ── OTP STEPS ── */}
              {(step === "OTP" || step === "FORGOT_OTP") && (
                <div className="space-y-5">
                  <div className="form-control">
                    <label className="label pb-2 justify-center">
                      <span className=" text-sm font-medium text-white">
                        6-digit verification code
                      </span>
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                      }}
                    />
                  </div>
                  <button
                    className={`w-full mt-2 py-3 rounded-xl text-white font-medium disabled:cursor-not-allowed
                bg-submit
                 transition ${loading || otp.length < 6 ? "cursor-not-allowed opacity-70 " : "hover:scale-105"}`}
                    onClick={step === "OTP" ? verifyOtp : verifyForgotOtp}
                    disabled={loading || otp.length < 6}
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                  <div className="flex flex-row justify-center text-center space-y-1 gap-2">
                    <p className="text-xs text-white/50 mt-1">
                      Didn't receive the code?
                    </p>
                    <button
                      className="text-white hover:text-white/50 text-xs normal-case"
                      onClick={async () => {
                        setOtp("");
                        setLoading(true);
                        try {
                          await requestOtpForgot(email);
                          showToast("New OTP Send", "alert-success");
                        } catch (err) {
                          handleError(err);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Resend OTP
                    </button>
                  </div>
                  <button
                    className="text-xs text-white/50 hover:text-white normal-case w-full"
                    onClick={() => setStep("EMAIL")}
                  >
                    Use a different email
                  </button>
                </div>
              )}

              {/* ── SET PASSWORD STEPS ── */}
              {(step === "SET_PASSWORD" || step === "FORGOT_SET_PASSWORD") && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="text-white text-sm font-medium">
                      New Password
                    </label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      placeholder="Create a strong password"
                      id="new-password"
                    />
                    {password === confirmPassword ? (
                      <></>
                    ) : (
                      <PasswordStrengthMeter password={password} />
                    )}

                    {password && (
                      <ul
                        className={`mt-2 space-y-1 ${password === confirmPassword ? "hidden" : "block"}  `}
                      >
                        {[
                          {
                            check: password.length >= 8,
                            text: "At least 8 characters",
                          },
                          {
                            check: /[A-Z]/.test(password),
                            text: "One uppercase letter",
                          },
                          { check: /[0-9]/.test(password), text: "One number" },
                          {
                            check: /[^A-Za-z0-9]/.test(password),
                            text: "One special character",
                          },
                        ].map(({ check, text }) => (
                          <li
                            key={text}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${check ? "text-white" : "text-white/50"}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {check ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              )}
                            </svg>
                            {text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="text-white text-sm font-medium">
                      Confirm Password
                    </label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                      }}
                      placeholder="Repeat your password"
                      id="confirm-password"
                    />
                    {confirmPassword && (
                      <p
                        className={`text-xs mt-1 font-medium ${password === confirmPassword ? "text-white" : "text-red-500"}`}
                      >
                        {password === confirmPassword
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <button
                    className={`w-full mt-2 py-3 rounded-xl text-white font-medium disabled:cursor-not-allowed
                bg-submit ${loading || password !== confirmPassword || !confirmPassword ? "cursor-not-allowed opacity-70" : "hover:scale-105"}
                 transition`}
                    onClick={() =>
                      handleSetPassword(step === "FORGOT_SET_PASSWORD")
                    }
                    disabled={
                      loading ||
                      password !== confirmPassword ||
                      !confirmPassword
                    }
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : step === "SET_PASSWORD" ? (
                      "Set Password & Continue"
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="absolute bottom-1  text-center text-base text-gray-500 mt-6">
          Developed by{" "}
          <a href="https://gadgetvishwa.in/" target="_blank">
            <span className="font-semibold text-white hover:text-orange-600 z-50 relative">
              Gadget_Vishwa 🍁
            </span>
          </a>
        </p>
      </div>
    </>
  );
}

export default Login;

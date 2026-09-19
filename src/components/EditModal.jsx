// edit profile card model
import { useState, useEffect, useRef } from "react";
import { LuUserRoundPlus } from "react-icons/lu";
import { UpdateEmployee, UpdateProfilePicture } from "../api/EmployeeServices";
const MAX_SIZE = 1 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// ─── Center-crop + compress to JPEG under maxBytes ───────────────────────────
function compressAndCrop(file, maxBytes = MAX_SIZE, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      // 1:1 center crop
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = 512;   // output size — good balance for profile pics
      canvas.height = 512;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);

      // Try reducing quality until under maxBytes
      const tryEncode = (q) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            if (blob.size <= maxBytes || q <= 0.1) {
              // Convert blob back to File
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
              });
              resolve(compressed);
            } else {
              tryEncode(parseFloat((q - 0.1).toFixed(1)));
            }
          },
          "image/jpeg",
          q
        );
      };
      tryEncode(quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function EditModal({ setEditModal, id, updateProfileDetail, setToast, profile, name, phone }) {
  const [form, setForm] = useState({ name: name || "", phone: phone || "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPic, setCurrentPic] = useState(profile ? profile : null);
  const [picFile, setPicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [picError, setPicError] = useState("");
  const inputRef = useRef(null);
  const avatarSrc = preview || currentPic;
  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setPicError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    setPicError("");
    try {
      const compressed = await compressAndCrop(file);
      setPicFile(compressed);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      setPicError("Failed to process image. Please try another.");
    }
  };

  const discardPicture = () => {
    setPicFile(null);
    setPicError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid 10-digit phone number";
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: "" }));
  };

  // ── Phone: digits only, send as string ──────────────────────────────────────
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10); // strip non-digits, cap at 10
    setForm(f => ({ ...f, phone: digitsOnly }));
    if (errors.phone) setErrors(err => ({ ...err, phone: "" }));
  };

  const handlePhoneKeyDown = (e) => {
    if (
      !/[\d]/.test(e.key) &&
      !["ArrowLeft", "ArrowRight", "Delete", "Tab", "Backspace"].includes(e.key)
    ) e.preventDefault();
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await UpdateEmployee(id, { full_name: form.name, phone: String(form.phone) });
      if (picFile) {
        const formData = new FormData();
        formData.append("picture", picFile);
        const picRes = await UpdateProfilePicture(formData);
        if (picRes.data?.picture) {
          setCurrentPic(picRes.data.picture);
          localStorage.setItem("pic", picRes.data.picture);
        }
      }
      showToast(`${form.name} updated successfully`, "alert-success");
      updateProfileDetail(form.name, id);
      setForm({ name: "", phone: "" });
      discardPicture();
      setEditModal(false);
    } catch (err) {
      const data = err.response?.data;
      if (data?.picture) {
        setPicError(data.picture[0]);
      }
      else if (data && typeof data === "object") {
        setErrors(data);
      }
      else {
        showToast("Something went wrong. Please try again.", "alert-error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      onClick={() => setEditModal(false)} >
      <div
        className=" w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()} >
        <h1 className="text-xl font-semibold text-center mb-5">
          Edit Profile
        </h1>
        <div className="flex flex-col justify-center ">
          <div className="relative flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
              <div className="w-35 h-35 rounded-full overflow-hidden bg-base-200 ring-2 ring-base-300 flex items-center justify-center">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setCurrentPic(null)} // fallback if image fails to load
                  />
                ) : (
                  <span className="text-3xl font-semibold text-base-content/40 select-none">
                    {form.name?.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <LuUserRoundPlus className="text-4xl text-white" />
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {picFile ? (
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={discardPicture} className="text-xs text-error hover:underline">
                  Undo
                </button>
              </div>
            ) : (
              <p className="text-xs text-base-content/40 mt-2"></p>
            )}

            {picError && (
              <p className="text-xs text-red-500 mt-1 text-center">{picError}</p>
            )}

          </div>

          {/* form field */}
          <div>
            <label className="text-sm text-zinc-500">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Tony Stark"
              className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors.name ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors.name ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`}
            />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm text-zinc-500">
              Phone<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              onKeyDown={handlePhoneKeyDown}
              maxLength={10}
              placeholder="9876543210"
              className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border ${errors.phone ? "border-red-500 border-2" : "border-white/20"} focus:ring-2 ${errors.phone ? "focus:ring-red-400/40" : "focus:ring-focus"} outline-none`}
            />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="modal-action">
          <button
            className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium hover:scale-105"
            onClick={() => setEditModal(false)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className={` ${loading ? "opacity-60" : ""} px-5 py-2 rounded-xl text-sm text-white  bg-submit  hover:scale-110 transition font-medium`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" /> Saving
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;




















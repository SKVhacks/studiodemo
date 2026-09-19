import { useState, useEffect } from "react";
import { AddEmployee, UpdateEmployee } from "../../api/EmployeeServices";

const INITIAL_STATE = { fullName: "", email: "", phone: "" };

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required
}) {
  return (
    <div className="form-control">
      <label className="text-sm font-medium text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          mt-1 px-4 py-2 rounded-xl w-full
          bg-white/60 dark:bg-white/10
          border ${error ? "border-red-500 border-2" : "border-white/20"}
          outline-none
          focus:ring-2 ${error ? "focus:ring-red-400/40" : "focus:ring-focus"}
          transition
        `}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error[0]}
        </p>
      )}
    </div>
  );
}

function EmployeeForm({ employee, onClose, showToast }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.full_name || "",
        email: employee.email || "",
        phone: String(employee.phone || ""), // ✅ ensure string
      });
    } else {
      setForm(INITIAL_STATE);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? value : value, // keep as string
    }));

    // clear error properly (match backend keys)
    if (name === "fullName" && errors.full_name) {
      setErrors((prev) => ({ ...prev, full_name: null }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // ✅ validation
    if (!form.fullName || form.fullName.trim() === "") {
      newErrors.full_name = ["Full name is required"];
    }

    if (!isEdit && (!form.email || form.email.trim() === "")) {
      newErrors.email = ["Email is required"];
    }

    if (!form.phone || form.phone.trim() === "") {
      newErrors.phone = ["Phone number is required"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (isEdit) {
        await UpdateEmployee(employee.id, {
          full_name: form.fullName,
          phone: String(form.phone), // ✅ FORCE STRING
        });
        showToast(`${form.fullName} Detail Updated`, "alert-success");
      } else {
        await AddEmployee({
          full_name: form.fullName,
          email: form.email,
          phone: String(form.phone), // ✅ FORCE STRING
        });
        showToast(`${form.fullName} Added`, "alert-success");
      }

      setForm(INITIAL_STATE);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setErrors(data);
      } else {
        showToast("Something went wrong. Please try again.", "alert-error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open bg-black/40 backdrop-blur-md p-4">
      <div className="
        modal-box w-full max-w-md
        bg-white/70 dark:bg-zinc-900/70
        backdrop-blur-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        border border-white/20 dark:border-zinc-700
        rounded-3xl
        p-6
      ">

        <h3 className="text-xl font-semibold text-center mb-6">
          {isEdit ? "Edit Staff" : "Add Staff"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">

          <FormField
            label="Full Name"
            name="fullName"
            placeholder="e.g. Tony Stark"
            value={form.fullName}
            onChange={handleChange}
            error={errors.full_name}
          />

          {!isEdit && (
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          )}

          <FormField
            label="Phone"
            name="phone"
            type="tel" // ✅ important
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-4 py-2 rounded-xl text-sm
                bg-zinc-200 dark:bg-zinc-700 font-medium
                hover:scale-105 transition
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={` ${loading ? "opacity-60":""}
                px-6 py-2 rounded-xl text-sm text-white font-medium
                bg-submit
                hover:scale-105 transition
                disabled:cursor-not-allowed
              `}
            >
              {loading
                ? "Processing..."
                : isEdit ? "Update" : "Create"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;
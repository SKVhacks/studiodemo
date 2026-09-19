const FormField = ({
    name,
    placeholder,
    textarea = false,
    errors = {},
    formData = {},
    setFormData,
}) => {
    const commonProps = {
        name,
        placeholder,
        value: formData[name] ?? "",
        onChange: (e) => setFormData((prev) => ({ ...prev, [name]: e.target.value })),
    };

    return (
        <div className="form-control w-full">
            {textarea ? (
                <textarea
                    {...commonProps}
                    className={`textarea textarea-bordered textarea-sm font-mono text-xs h-32 w-full ${
                        errors[name] ? "textarea-error" : ""
                    }`}
                />
            ) : (
                <input
                    type="text"
                    {...commonProps}
                    className={`input input-bordered input-sm w-full ${
                        errors[name] ? "input-error" : ""
                    }`}
                />
            )}
            {errors[name] && (
                <p className="text-error text-xs mt-1">{errors[name]}</p>
            )}
        </div>
    );
};

export default FormField;

const FormActions = ({ onCancel, onSave, saving }) => (
    <div className="flex gap-2 justify-end mt-3">
        <button
            className="
                flex items-center justify-center
                text-white/50
                px-2 py-2 lg:py-1.5
                rounded-xl
                font-medium
                 text-base
                transition-all duration-200 ease-in-out
                
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer"
            onClick={onCancel}
            disabled={saving}
        >
            Cancel
        </button>
        <button
            className="
                flex items-center justify-center
                bg-submit
                px-3.5 py-1.5
                rounded-xl
                font-medium
                 text-base
                shadow-md
                transition-all duration-200 ease-in-out
                active:scale-95 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer"
            onClick={onSave}
            disabled={saving}
        >
            {saving ? (
                <>
                    <span className="loading loading-spinner loading-xs" />
                    Saving
                </>
            ) : (
                "Save"
            )}
        </button>
    </div>
);

export default FormActions;
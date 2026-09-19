
const ConfirmModal = ({ id, title, message, onConfirm, onCancel, loading }) => (
    <dialog id={id} className="modal modal-open">
        <div className="modal-box max-w-sm w-[90vw]">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="py-4 text-sm text-base-content/70">{message}</p>
            <div className="modal-action flex gap-2 justify-end">
                <button
                    className="btn btn-ghost hover:text-red-500"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    className="btn border-none bg-red-500 hover:bg-red-600 text-white"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        "Delete"
                    )}
                </button>
            </div>
        </div>
        <div className="modal-backdrop" onClick={onCancel} />
    </dialog>
);

export default ConfirmModal;
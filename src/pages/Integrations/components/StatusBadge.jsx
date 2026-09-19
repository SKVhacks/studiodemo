const StatusBadge = ({ active, labels = ["Active", "Inactive"] }) => (
    <span
        className={`text-sm px-2 py-1 text-white font-medium rounded-full ${
            active ? "bg-lime-500" : "bg-red-500"
        }`}
    >
        {active ? labels[0] : labels[1]}
    </span>
);

export default StatusBadge;
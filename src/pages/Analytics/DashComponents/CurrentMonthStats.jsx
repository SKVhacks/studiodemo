import React from "react";

const statsConfig = [
  { label: "Clients" },
  { label: "Events" },
  { label: "Paid" },
  { label: "Unpaid" },
  { label: "Scheduled" },
  { label: "Shouted" },
  { label: "Processing" },
  { label: "Completed" },
  { label: "Cancelled" },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const CurrentMonthStats = ({ data }) => {
  return (
    <div className="px-4 pb-6">

      <div className="
        grid gap-4
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-3 
        lg:grid-cols-3
      ">
        {statsConfig.map((item, i) => (
          <div
            key={i}
            className="
              rounded-2xl p-4

              /* LIGHT MODE */
              bg-white
              border border-gray-200
              shadow-[0_4px_12px_rgba(0,0,0,0.05)]

              /* DARK MODE */
              dark:bg-white/5
              dark:border-white/10
              dark:shadow-none
              dark:backdrop-blur-md

              transition-all duration-300
              hover:shadow-lg dark:hover:bg-white/10
            "
          >
            {/* Label */}
            <p className="
              text-xs mb-1
              text-gray-500 
              dark:text-gray-400
            ">
              {item.label}
            </p>

            {/* Value */}
            <h3 className={`
              text-lg md:text-xl font-semibold
              ${item.label == "Cancelled" ?"text-red-500" :"text-gray-900 dark:text-white"}
            `}>
              {(item.label === "Paid" || item.label === "Unpaid")
                ? formatCurrency(data[i])
                : data[i] ?? 0}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentMonthStats;
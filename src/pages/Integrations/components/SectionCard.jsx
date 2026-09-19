// components/SectionCard.jsx
import StatusBadge from "./StatusBadge";

const SectionCard = ({ icon, title, subtitle, children, active, label }) => (
    <div className="w-full max-w-2xl bg-base-100 shadow-xl border border-base-300 rounded-xl">
        <div className="p-4 sm:p-6">
            {/* Header: icon + title + badge + subtitle */}
            <div className="flex items-start gap-3">
                <span className="text-5xl sm:text-6xl mt-1 shrink-0">{icon}</span>

                <div className="relative flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h2 className="font-bold text-base sm:text-lg">{title}</h2>
                        {active !== undefined && (
                            <StatusBadge active={active} labels={label} />
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-base-content/60 text-justify mt-0.5">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="mt-4">{children}</div>
        </div>
    </div>
);

export default SectionCard;
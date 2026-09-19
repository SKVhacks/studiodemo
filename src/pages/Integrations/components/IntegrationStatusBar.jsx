// components/IntegrationStatusBar.jsx
import { useState, useEffect } from "react";
import { MdWhatsapp } from "react-icons/md";
import { SiGooglesheets, SiGooglecalendar } from "react-icons/si";
import {
    getWhatsAppService,
    getSheetsConfig,
    getCalendarConfig,
} from "../../../api/IntegrationServices";

/**
 * Extracts the first item from an API response regardless of shape.
 */
const extractFirst = (result) => {
    if (result.status !== "fulfilled") return null;
    const d = result.value.data;
    return Array.isArray(d) ? d[0] : d?.results?.[0] || null;
};

/**
 * IntegrationStatusBar
 * Shows a summary card for each integration: Active / Configured-Off / Not configured.
 */
const IntegrationStatusBar = () => {
    const [statuses, setStatuses] = useState({
        whatsapp: null,
        sheets: null,
        calendar: null,
    });

    useEffect(() => {
        const fetchAll = async () => {
            const [wa, sh, cal] = await Promise.allSettled([
                getWhatsAppService(),
                getSheetsConfig(),
                getCalendarConfig(),
            ]);
            setStatuses({
                whatsapp: extractFirst(wa),
                sheets: extractFirst(sh),
                calendar: extractFirst(cal),
            });
        };
        fetchAll();
    }, []);

    const items = [
        {
            label: "WhatsApp Business",
            icon: <MdWhatsapp className="text-green-500" />,
            active: statuses.whatsapp?.is_enabled === true,
            configured: Boolean(statuses.whatsapp),
        },
        {
            label: "Google Sheets",
            icon: <SiGooglesheets className="text-green-600" />,
            active: Boolean(statuses.sheets),
            configured: Boolean(statuses.sheets),
        },
        {
            label: "Google Calendar",
            icon: <SiGooglecalendar className="text-blue-500" />,
            active: Boolean(statuses.calendar),
            configured: Boolean(statuses.calendar),
        },
    ];

    return (
        <div className="grid grid-cols-3  gap-2 mb-6">
            {items.map(({ label, icon, active, configured }) => (
                <div
                    key={label}
                    className={`flex flex-col items-center text-center  rounded-xl px-3 py-3 border border-white/20 dark:border-white/10
        bg-white/60 dark:bg-white/5
        backdrop-blur-xl `}
                >
                    
                    <span className="text-4xl sm:text-5xl">{icon}</span>
                    <h2 className="font-semibold text-base sm:text-lg text-black dark:text-white
                     mt-1">
                        {label}
                    </h2>
                    <p
                        className={`text-sm font-medium mt-0.5 ${active
                                ? "text-green-700"
                                : configured
                                    ? "text-yellow-600"
                                    : "text-red-600"
                            }`}
                    >
                        {active
                            ? "Active"
                            : configured
                                ? "Configured / Off"
                                : "Not Configured"}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default IntegrationStatusBar;
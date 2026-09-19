// pages/IntegrationSettings.jsx
import { useNavigate } from "react-router-dom";

import IntegrationStatusBar from "./components/IntegrationStatusBar";
import WhatsAppSection      from "./sections/WhatsAppSection";
import SheetsSection        from "./sections/SheetsSection";
import CalendarSection      from "./sections/CalendarSection";

const IntegrationSettings = () => {
    const navigate = useNavigate();

    return (
        <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl px-3 py-0 min-h-screen">
            {/* Breadcrumb */}
            <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className='no-underline hover:no-underline hover:text-bread'>Home</a></li>
                        <li><a className='text-bread no-underline hover:no-underline'>Integrations</a></li>
                    </ul>
                </div>

            {/* Page heading */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                            Integrations
                        </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal tracking-wide mt-1 max-w-xl">
                    Manage Automation Services. Each integration can be configured independently.
                </p>
            </div>
            <div className="my-10 text- text-center text-red-500 font-semibold text-md">
                <p>“This feature will not work in Demo Mode. You can see which credentials are required to configure it.”</p>
            </div>
            {/* Status overview */}
            {/* <IntegrationStatusBar /> */}

            {/* Integration sections — stacked on mobile, row on lg */}
            <div className="flex flex-col lg:flex-row gap-4 items-start mb-5">
                <WhatsAppSection />
                <SheetsSection />
                <CalendarSection />
            </div>
        </div>
    );
};

export default IntegrationSettings;
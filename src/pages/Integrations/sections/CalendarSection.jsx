// sections/CalendarSection.jsx
import React, { useState } from "react";
import { SiGooglecalendar } from "react-icons/si";
import {
    getCalendarConfig,
    createCalendarConfig,
    deleteCalendarConfig,
} from "../../../api/IntegrationServices";

import useIntegrationConfig from "../hooks/useIntegrationConfig";
import SectionCard from "../components/SectionCard";
import ConfirmModal from "../components/ConfirmModal";
import FormField from "../components/FormField";
import FormActions from "../components/FormActions";
import Button from "../../../components/Button"
// ─── Default form values ──────────────────────────────────────────────────────
const DEFAULT_FORM = {
    calendar_id: "primary",
    timezone: "Asia/Kolkata",
    service_account_json: "",
};

// ─── Sub-component: configured state view ────────────────────────────────────
const CalendarConfigView = ({ config, onDelete }) => (
    <div className="space-y-3 mt-2">
        <div className="bg-base-300 rounded-lg px-3 py-4 space-y-1">
            <p className="text-xs text-base-content/50 truncate">
                Calendar ID:
                <span className="ml-2 text-base-content text-sm">
                    {config.calendar_id}
                </span>
            </p>
            <p className="text-xs text-base-content/50">
                Timezone:
                <span className="ml-2 text-base-content text-sm">
                    {config.timezone}
                </span>
            </p>
        </div>

        <p className="text-xs text-base-content/50 text-justify">
            <span className="text-red-500">*</span> Credentials saved securely — not
            displayed for security. To update, delete and re-add.
        </p>

        <div className="flex justify-end">
            <button
                className="btn bg-red-500 text-white border-none hover:bg-red-600"
                onClick={onDelete}
            >
                Delete Config
            </button>
        </div>
    </div>
);

// ─── Sub-component: add new config form ──────────────────────────────────────
const CalendarForm = ({ onCancel, onSave, saving, errors }) => {
    const [formData, setFormData] = useState(DEFAULT_FORM);

    return (
        <div className="space-y-3 mt-3">
            <div className="alert alert-warning py-2">
                <span className="text-sm">
                    Share the calendar with your service account email →{" "}
                    <strong>"Make changes to events"</strong> permission. JSON credentials
                    are stored securely and never shown again.
                </span>
            </div>

            {/* Calendar ID */}
            <div>
                <label className="label-text text-sm font-medium">Calendar ID</label>
                <FormField
                    name="calendar_id"
                    placeholder="As1Ec...."
                    errors={errors}
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {/* Timezone */}
            <div>
                <label className="label-text text-sm font-medium">
                    Timezone{" "}
                    <span className="text-xs text-red-500/50">
                        Don't change if India
                    </span>
                </label>
                <FormField
                    name="timezone"
                    placeholder="Asia/Kolkata"
                    errors={errors}
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {/* Service Account JSON */}
            <div>
                <label className="label-text text-sm font-medium">
                    Service Account JSON{" "}
                    <span className="text-xs text-base-content/40">
                        Paste full JSON key file
                    </span>
                </label>
                <FormField
                    name="service_account_json"
                    placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'}
                    textarea
                    errors={errors}
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {errors.non_field && (
                <p className="text-error text-xs">{errors.non_field}</p>
            )}

            <FormActions
                onCancel={onCancel}
                onSave={() => onSave(formData)}
                saving={saving}
            />
        </div>
    );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const CalendarSection = () => {
    const { config, setConfig, loading } = useIntegrationConfig(getCalendarConfig);

    const [showForm, setShowForm]     = useState(false);
    const [saving, setSaving]         = useState(false);
    const [deleting, setDeleting]     = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [errors, setErrors]         = useState({});

    const handleSave = async (formData) => {
        setSaving(true);
        setErrors({});
        try {
            const res = await createCalendarConfig(formData);
            setConfig(res.data);
            setShowForm(false);
        } catch (err) {
            setErrors(err.response?.data || { non_field: "Failed to save." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteCalendarConfig(config.id);
            setConfig(null);
            setShowDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const icon = <SiGooglecalendar className="text-blue-500" />;

    if (loading)
        return (
            <SectionCard icon={icon} title="Google Calendar" subtitle="Loading...">
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md" />
                </div>
            </SectionCard>
        );

    return (
        <SectionCard
            icon={icon}
            title="Google Calendar"
            subtitle="Sync events to Google Calendar"
            active={Boolean(config)}
            label={["Configured", "Not configured"]}
        >
            {config ? (
                <CalendarConfigView
                    config={config}
                    onDelete={() => setShowDelete(true)}
                />
            ) : showForm ? (
                <CalendarForm
                    onCancel={() => setShowForm(false)}
                    onSave={handleSave}
                    saving={saving}
                    errors={errors}
                />
            ) : (
                <div className="flex flex-col items-center  gap-3">
                    <p className="text-sm text-red-500/50">
                        Google Calendar not configured yet.
                    </p>
                    <Button text="Configure Calendar" bg="bg-bread"  onClick={()=> setShowForm(true)} />
                </div>
            )}

            {showDelete && (
                <ConfirmModal
                    id="cal-delete"
                    title="Delete Calendar Config?"
                    message="This will stop all Google Calendar sync. Existing calendar events will not be deleted from Google Calendar."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                    loading={deleting}
                />
            )}
        </SectionCard>
    );
};

export default CalendarSection;
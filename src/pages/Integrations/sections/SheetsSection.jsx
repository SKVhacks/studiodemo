// sections/SheetsSection.jsx
import React, { useState } from "react";
import { SiGooglesheets } from "react-icons/si";
import {
    getSheetsConfig,
    createSheetsConfig,
    deleteSheetsConfig,
} from "../../../api/IntegrationServices";

import useIntegrationConfig from "../hooks/useIntegrationConfig";
import SectionCard from "../components/SectionCard";
import ConfirmModal from "../components/ConfirmModal";
import FormField from "../components/FormField";
import FormActions from "../components/FormActions";
import Button from "../../../components/Button"
// ─── Default form values ──────────────────────────────────────────────────────
const DEFAULT_FORM = {
    spreadsheet_id: "",
    service_account_json: "",
    clients_sheet: "Clients",
    events_sheet: "Events",
    payments_sheet: "Payments",
};

// ─── Sub-component: configured state view ────────────────────────────────────
const SheetsConfigView = ({ config, onDelete }) => (
    <div className="space-y-3 mt-2">
        <div className="bg-base-300 rounded-lg px-3 py-4 space-y-2">
            <p className="text-xs text-base-content/50 truncate">
                Spreadsheet ID:
                <span className="ml-2 text-white text-sm">{config.spreadsheet_id}</span>
            </p>
            <p className="text-sm text-base-content/50">Created Tabs in the Google Sheet</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
                {["clients_sheet", "events_sheet", "payments_sheet"].map((key) => (
                    <p key={key} className="text-sm font-semibold">
                        {config[key]}
                    </p>
                ))}
            </div>
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
const SheetsForm = ({ onCancel, onSave, saving, errors }) => {
    const [formData, setFormData] = useState(DEFAULT_FORM);

    return (
        <div className="space-y-3 mt-3">
            <div className="alert alert-warning py-2">
                <span className="text-sm">
                    Share the spreadsheet with your service account email as{" "}
                    <strong>Editor</strong>. Tabs are auto-created with headers if they
                    don't exist. JSON credentials are stored securely and never shown again.
                </span>
            </div>

            {/* Spreadsheet ID */}
            <div>
                <label className="label-text text-sm font-medium">Spreadsheet ID</label>
                <FormField
                    name="spreadsheet_id"
                    placeholder="Enter the Spreadsheet ID"
                    errors={errors}
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>

            {/* Sheet tab names */}
            <div>
                <label className="label-text text-sm font-medium">
                    Tab Names{" "}
                    <span className="text-xs text-red-500/50">Don't leave empty</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    <FormField
                        name="clients_sheet"
                        placeholder="Clients"
                        errors={errors}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <FormField
                        name="events_sheet"
                        placeholder="Events"
                        errors={errors}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <FormField
                        name="payments_sheet"
                        placeholder="Payments"
                        errors={errors}
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>
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
const SheetsSection = () => {
    const { config, setConfig, loading } = useIntegrationConfig(getSheetsConfig);

    const [showForm, setShowForm]     = useState(false);
    const [saving, setSaving]         = useState(false);
    const [deleting, setDeleting]     = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [errors, setErrors]         = useState({});

    const handleSave = async (formData) => {
        setSaving(true);
        setErrors({});
        try {
            const res = await createSheetsConfig(formData);
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
            await deleteSheetsConfig(config.id);
            setConfig(null);
            setShowDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const icon = <SiGooglesheets className="text-green-600" />;

    if (loading)
        return (
            <SectionCard icon={icon} title="Google Sheets" subtitle="Loading...">
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md" />
                </div>
            </SectionCard>
        );

    return (
        <SectionCard
            icon={icon}
            title="Google Sheets"
            subtitle="Automatically sync data to a Google Spreadsheet in real time."
            active={Boolean(config)}
            label={["Configured", "Not configured"]}
        >
            {config ? (
                <SheetsConfigView
                    config={config}
                    onDelete={() => setShowDelete(true)}
                />
            ) : showForm ? (
                <SheetsForm
                    onCancel={() => setShowForm(false)}
                    onSave={handleSave}
                    saving={saving}
                    errors={errors}
                />
            ) : (
                <div className="flex flex-col items-center  gap-3">
                    <p className="text-sm text-red-500/50">
                        Google Sheets not configured yet.
                    </p>
                    <Button text="Configure Sheets" bg="bg-bread"  onClick={()=> setShowForm(true)} />
                </div>
            )}

            {showDelete && (
                <ConfirmModal
                    id="sheets-delete"
                    title="Delete Sheets Config?"
                    message="This will stop all Google Sheets sync. Events, Clients and Payments will no longer be written to the spreadsheet."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                    loading={deleting}
                />
            )}
        </SectionCard>
    );
};

export default SheetsSection;
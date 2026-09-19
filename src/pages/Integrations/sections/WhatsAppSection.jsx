// sections/WhatsAppSection.jsx
import React, { useState } from "react";
import { MdWhatsapp } from "react-icons/md";
import {
    getWhatsAppService,
    createWhatsAppService,
    deleteWhatsAppService,
    toggleWhatsApp,
} from "../../../api/IntegrationServices";

import useIntegrationConfig from "../hooks/useIntegrationConfig";
import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import FormActions from "../components/FormActions";
import Button from "../../../components/Button";
import { FaPlus } from "react-icons/fa6";
// ─── Default form values ──────────────────────────────────────────────────────
const DEFAULT_FORM = {
    is_enabled: false,
    phone_number_id: "",
    access_token: "",
};

// ─── Sub-component: existing service view ────────────────────────────────────
const WhatsAppServiceView = ({ service, toggling, onToggle, onDelete }) => (
    <div className="space-y-3 mt-2">
        {/* Enable / Disable toggle row */}
        <div className="flex items-center justify-between bg-base-200 rounded-lg px-4 py-3 gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge
                    active={service.is_enabled}
                    labels={["Enabled", "Disabled"]}
                />
                <span className="text-sm text-base-content/70">
                    {service.is_enabled
                        ? "Messages will be sent to clients"
                        : "No messages will be sent"}
                </span>
            </div>
            <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={service.is_enabled}
                onChange={onToggle}
                disabled={toggling}
            />
        </div>

        {/* Credentials status */}
        <div className="bg-base-200 rounded-lg px-4 py-3">
            <p className="text-xs text-base-content/50 mb-2">API Credentials</p>
            {service.has_credentials ? (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-success badge-sm">Configured</span>
                    <span className="text-xs text-base-content/50">
                        Credentials saved securely — not displayed for security
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-warning badge-sm">Not set</span>
                    <span className="text-xs text-warning">
                        ⚠ Running in console mode — no real messages sent
                    </span>
                </div>
            )}
        </div>

        {/* Warning when credentials missing */}
        {!service.has_credentials && (
            <div className="alert alert-warning py-2">
                <span className="text-xs">
                    API credentials not set. Delete this service and re-add with your Meta
                    Phone Number ID and Access Token to go live.
                </span>
            </div>
        )}

        <div className="flex justify-end">
            <button
                className="
                flex items-center justify-center
                bg-red-500
                px-2 py-2 lg:py-1.5
                rounded-xl
                font-medium
                 text-base
                shadow-md
                transition-all duration-200 ease-in-out
                active:scale-95 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer"
                onClick={onDelete}
            >
                Delete Service
            </button>
        </div>
    </div>
);

// ─── Sub-component: add new service form ─────────────────────────────────────
const WhatsAppForm = ({ onCancel, onSave, saving, errors }) => {
    const [formData, setFormData] = useState(DEFAULT_FORM);

    const handleChange = (field) => (e) =>
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="space-y-3 mt-3">
            <div className="alert alert-info py-2">
                <span className="text-xs">
                    Credentials are stored securely and never shown again after saving.
                    Leave blank to run in console mode for now.
                </span>
            </div>

            {/* Phone Number ID */}
            <div className="form-control">
                <label className="label py-1">
                    <span className="label-text text-sm">Phone Number ID</span>
                    <span className="label-text-alt text-xs opacity-50">
                        From Meta Business Dashboard
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="e.g. 123456789012345"
                    className={`input input-bordered input-sm w-full ${
                        errors.phone_number_id ? "input-error" : ""
                    }`}
                    value={formData.phone_number_id}
                    onChange={handleChange("phone_number_id")}
                />
                {errors.phone_number_id && (
                    <p className="text-error text-xs mt-1">{errors.phone_number_id}</p>
                )}
            </div>

            {/* Access Token */}
            <div className="form-control">
                <label className="label py-1">
                    <span className="label-text text-sm">Access Token</span>
                    <span className="label-text-alt text-xs opacity-50">
                        Permanent token from Meta
                    </span>
                </label>
                <input
                    type="password"
                    placeholder="EAAxxxxxxxxxxxxx..."
                    className={`input input-bordered input-sm w-full ${
                        errors.access_token ? "input-error" : ""
                    }`}
                    value={formData.access_token}
                    onChange={handleChange("access_token")}
                />
                {errors.access_token && (
                    <p className="text-error text-xs mt-1">{errors.access_token}</p>
                )}
            </div>

            {/* Enable immediately toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    className="toggle toggle-success toggle-xs"
                    checked={formData.is_enabled}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            is_enabled: e.target.checked,
                        }))
                    }
                />
                <span className="text-sm">Enable WhatsApp immediately after saving</span>
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
const WhatsAppSection = () => {
    const { config: service, setConfig: setService, loading } =
        useIntegrationConfig(getWhatsAppService);

    const [toggling, setToggling]     = useState(false);
    const [deleting, setDeleting]     = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const [saving, setSaving]         = useState(false);
    const [errors, setErrors]         = useState({});

    const handleToggle = async () => {
        if (!service) return;
        setToggling(true);
        try {
            const res = await toggleWhatsApp(service.id, !service.is_enabled);
            setService(res.data);
        } finally {
            setToggling(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteWhatsAppService(service.id);
            setService(null);
            setShowDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async (formData) => {
        setSaving(true);
        setErrors({});
        try {
            const res = await createWhatsAppService(formData);
            setService(res.data);
            setShowForm(false);
        } catch (err) {
            setErrors(err.response?.data || { non_field: "Failed to save." });
        } finally {
            setSaving(false);
        }
    };

    const icon = <MdWhatsapp className="text-green-500" />;

    if (loading)
        return (
            <SectionCard icon={icon} title="WhatsApp" subtitle="Loading...">
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md" />
                </div>
            </SectionCard>
        );

    return (
        <SectionCard
            icon={icon}
            title="WhatsApp"
            subtitle="Send automated WhatsApp messages to clients. Uses Meta WhatsApp Business API."
            active={service?.is_enabled ?? false}
            label={["Enabled", "Disabled"]}
        >
            
            {service ? (
                <WhatsAppServiceView
                    service={service}
                    toggling={toggling}
                    onToggle={handleToggle}
                    onDelete={() => setShowDelete(true)}
                />
            ) : showForm ? (
                <WhatsAppForm
                    onCancel={() => setShowForm(false)}
                    onSave={handleSave}
                    saving={saving}
                    errors={errors}
                />
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-red-500/50">
                        WhatsApp service not configured yet.
                    </p>
                   
                    <Button text="Configure Whatsapp" bg="bg-bread"  onClick={()=> setShowForm(true)} />
                </div>
            )}

            {showDelete && (
                <ConfirmModal
                    id="wa-delete"
                    title="Delete WhatsApp Service?"
                    message="This will remove all credentials and disable WhatsApp notifications. You can re-add it anytime."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                    loading={deleting}
                />
            )}
        </SectionCard>
    );
};

export default WhatsAppSection;
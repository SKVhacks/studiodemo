import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FetchEmployee, DeleteEmployee, ForceLogout } from "../../api/EmployeeServices";
import EmployeeForm from './EmployeeForm';
import Toast from "../../components/Toast";
import { IoMdPersonAdd } from "react-icons/io";
import UnblockEmployeeModal from './UnblockEmployeeModal';
import Button from "../../components/Button";
import EmployeeProfileCard from "../../components/EmployeeProfileCard";
import { useAuth } from "../../context/AuthContext";
const COLORS = [
    "bg-indigo-600", "bg-pink-500", "bg-emerald-500",
    "bg-orange-500", "bg-violet-600", "bg-cyan-500",
    "bg-rose-500", "bg-teal-500"
];

function Staff() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const { role, userID, } = useAuth();
    const navigate = useNavigate();
    const [tableLoading, setTableLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [unblockEmployee, setUnblockEmployee] = useState(null);
    const [previewEmployee, setPreviewEmployee] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchEmployees = async (isFirstLoad = false) => {
       
        try {
            setTableLoading(true);
            const res = await FetchEmployee();
            setEmployees(res.data);
        } catch (err) {
            console.error(err.response?.data);
            showToast("Failed to load employees", "alert-error");
        } finally {
            
            setTableLoading(false);
        }
    };

    // First mount
    useEffect(() => {
        fetchEmployees(true);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to Block this employee?")) return;
        try {
            await DeleteEmployee(id);
            showToast("Employee Blocked Successfully", "alert-success");
            fetchEmployees(false);
        } catch (err) {
            console.error(err.response?.data);
            showToast(err.response?.data?.error, "alert-error");
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingEmployee(null);
        setShowForm(true);
    };

    const handleForceLogout = async (id) => {
        if (!window.confirm("Force logout this employee from all devices?")) return;
        try {
            await ForceLogout(id);
            showToast("Employee sessions revoked successfully", "alert-success");
        } catch (err) {
            console.error(err.response?.data);
            showToast(err.response?.data?.error, "alert-error");
        }
    };

    

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}

            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl p-3 py-0 min-h-screen">
                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className="no-underline hover:no-underline hover:text-bread">Home</a></li>
                        <li><a className="text-bread no-underline hover:no-underline">Staff</a></li>
                    </ul>
                </div>

                <div className="my-1 mb-4 flex flex-col gap-1">
                    <div className='flex flex-row justify-between'>
                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">Staff</h1>
                        <div className="mt-1.5 md:mt-0">
                            <Button modal={handleAddNew} bg="bg-indigo-500" hoverBg="hover:bg-indigo-600" logo={<IoMdPersonAdd />} text="Staff" />
                        </div>
                    </div>
                </div>
                <div className="relative">
                    {tableLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-neutral-400 dark:text-neutral-500" />
                        </div>
                    )}
                    {employees.length === 0 && !tableLoading ? (
                        <p className="grid place-items-center h-full text-gray-400">No Data to Display</p>
                    ) : (
                        <div className="rounded-2xl overflow-x-auto border border-gray-200 bg-white/65 shadow-sm dark:border-white/10 dark:bg-[#16181A]/60 dark:backdrop-blur-xl">
                            <table className="table w-full text-center capitalize">
                                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                                    <tr className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <th>Emp ID</th>
                                        <th>Profile</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Joined</th>
                                        <th>Permission</th>
                                        <th>Activation</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
                                    {employees.sort((a, b) => a.id - b.id).map((emp, index) => (
                                        <tr
                                            key={emp.id}
                                            className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/[0.02] cursor-pointer"
                                            onClick={() => { setPreviewEmployee(emp); setPreviewIndex(index); }}
                                        >
                                            <td>{emp.id}</td>
                                            <td className="align-middle text-center py-2">
                                                {emp.role === "ADMIN" ? (
                                                    <div className="inline-flex p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                                        <div className="bg-white dark:bg-zinc-900 p-[2px] rounded-full">
                                                            {emp.picture ? (
                                                                <img
                                                                    src={emp.picture}
                                                                    alt={emp.full_name}
                                                                    className="h-10 w-10 md:h-14 md:w-14 object-cover rounded-full"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`h-10 w-10 md:h-14 md:w-14 rounded-full ${COLORS[index % COLORS.length]
                                                                        } text-white flex items-center justify-center text-lg font-bold shadow-md capitalize`}
                                                                >
                                                                    {emp.full_name.slice(0, 2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    emp.picture ? (
                                                        <img
                                                            src={emp.picture}
                                                            alt={emp.full_name}
                                                            className="h-10 w-10 md:h-14 md:w-14 object-cover rounded-full mx-auto"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`h-10 w-10 md:h-14 md:w-14 rounded-full ${COLORS[index % COLORS.length]
                                                                } text-white flex items-center justify-center text-lg font-bold shadow-md capitalize mx-auto`}
                                                        >
                                                            {emp.full_name.slice(0, 2)}
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                            <td>
                                                <p className="font-semibold text-gray-900 dark:text-white capitalize tooltip text-base" data-tip={emp.full_name.length > 15 ? emp.full_name : ""}>
                                                    {emp.full_name.length > 15 ? emp.full_name.slice(0, 15) + "..." : emp.full_name}
                                                </p>
                                            </td>
                                            <td className="lowercase text-indigo-500">
                                                <a href={`mailto:${emp.email}`} className="tooltip" data-tip="Click To Write Mail">{emp.email}</a>
                                            </td>
                                            <td className="lowercase">
                                                <a href={`tel:+91${emp.phone}`} className="tooltip" data-tip="Click To Make Call">{emp.phone}</a>
                                            </td>
                                            <td>
                                                {new Date(emp.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric", month: "short", day: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${emp.is_active ? "bg-green-300/20 text-green-600" : "bg-red-400/20 text-red-600"}`}>
                                                    {emp.is_active ? "Access" : "Blocked"}
                                                </p>
                                            </td>
                                            <td>
                                                <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${emp.is_password_set ? "bg-green-300/20 text-green-600" : "bg-yellow-500/20 text-yellow-400"}`}>
                                                    {emp.is_password_set ? "Success" : "Pending"}
                                                </p>
                                            </td>
                                            {emp.id != userID && (
                                                <td className="text-center">
                                                    <div className="flex flex-row justify-center items-center gap-2 font-medium">

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}
                                                            data-tip="Edit Employee"
                                                            className="tooltip tooltip-warning flex items-center justify-center text-sm bg-transparent text-yellow-500 md:hover:scale-105 dark:hover:text-white hover:text-gray-800 transition"
                                                        >
                                                            Modify
                                                        </button>

                                                        <span className="text-zinc-400">|</span>

                                                        {emp.is_active
                                                            ? <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }}
                                                                data-tip="Block Permission"
                                                                className="w-12 tooltip tooltip-error flex items-center justify-center text-sm bg-transparent text-rose-500 md:hover:scale-105 dark:hover:text-white hover:text-gray-800 transition"
                                                            >
                                                                Block
                                                            </button>
                                                            : <button
                                                                onClick={(e) => { e.stopPropagation(); setUnblockEmployee(emp); }}
                                                                data-tip="Unblock Employee"
                                                                className="w-12 tooltip tooltip-success flex items-center justify-center text-sm bg-transparent text-green-500 md:hover:scale-105 dark:hover:text-white hover:text-gray-800 transition"
                                                            >
                                                                Unblock
                                                            </button>
                                                        }
                                                        <span className="text-zinc-400">|</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleForceLogout(emp.id); }}
                                                            data-tip="Logout from all devices"
                                                            className="tooltip tooltip-primary flex items-center justify-center text-sm bg-transparent text-violet-500 md:hover:scale-105 dark:hover:text-white hover:text-gray-800 transition"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {previewEmployee && (
                    <EmployeeProfileCard
                        employee={previewEmployee}
                        index={previewIndex}
                        onClose={() => setPreviewEmployee(null)}
                        onEdit={handleEdit}
                        onBlock={(emp) => emp.is_active ? handleDelete(emp.id) : setUnblockEmployee(emp)}
                        onForceLogout={handleForceLogout}
                        BACKEND_URL={BACKEND_URL}
                    />
                )}

                {showForm && (
                    <EmployeeForm
                        employee={editingEmployee}
                        onClose={() => { setShowForm(false); fetchEmployees(false); }}
                        showToast={showToast}
                    />
                )}

                {unblockEmployee && (
                    <UnblockEmployeeModal
                        employee={unblockEmployee}
                        onClose={() => { setUnblockEmployee(null); fetchEmployees(false); }}
                        showToast={showToast}
                    />
                )}
            </div>
        </>
    );
}

export default Staff;
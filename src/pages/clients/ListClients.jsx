import SearchBox from "../../components/SearchBox";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ViewAllClient, DeleteClient } from "../../api/ClientServices";
import ClientForm from "./ClientForm";
import Toast from "../../components/Toast";
import { IoIosPeople } from "react-icons/io";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

const PAGE_SIZE = 25; // single source of truth

const getPaginationPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 4) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 3) pages.push("...");
    pages.push(total);
    return pages;
};

const ListClients = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [clients, setClients] = useState([]);
    const [toast, setToast] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState(null); // client data store for update/creation temp storage
    // filters.sorting
    const [filterType, setFilterType] = useState("");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    // pagination
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;

    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchAllClients = async (p = 1) => {
        try {
            setTableLoading(true);
            const params = { page: p, page_size: PAGE_SIZE };
            if (search) params.search = search;

            const today = new Date();
            if (filterType === "this_month") {
                params.created_at_from = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1,
                )
                    .toISOString()
                    .split("T")[0];
                params.created_at_to = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0,
                )
                    .toISOString()
                    .split("T")[0];
            } else if (filterType === "last_month") {
                params.created_at_from = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1,
                )
                    .toISOString()
                    .split("T")[0];
                params.created_at_to = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0,
                )
                    .toISOString()
                    .split("T")[0];
            } else if (filterType === "previous_month") {
                params.created_at_from = new Date(
                    today.getFullYear(),
                    today.getMonth() - 2,
                    1,
                )
                    .toISOString()
                    .split("T")[0];
                params.created_at_to = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    0,
                )
                    .toISOString()
                    .split("T")[0];
            } else if (filterType === "custom" && customFrom && customTo) {
                params.created_at_from = customFrom;
                params.created_at_to = customTo;
            }
            const res = await ViewAllClient(params);
            setClients(res.data.results);
            setTotalCount(res.data.count || 0);
            setHasNext(!!res.data.next);
        } catch (error) {
            console.error(error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchAllClients(1);
    }, [search, filterType, customFrom, customTo]);

    // Fetch when page changes (but not when page was just reset to 1 by filter change)
    const prevPage = useRef(1);
    useEffect(() => {
        if (page === prevPage.current) return;
        prevPage.current = page;
        fetchAllClients(page);
    }, [page]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to permentely delete ?")) {
            try {
                const temp = await DeleteClient(id);
                showToast(temp.data?.message, "alert-success");
                fetchAllClients(page);
            } catch (error) {
                showToast(error.response?.data?.error, "alert-error");
            }
        }
    };

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}
            <div className="mx-auto bg-gray-50 dark:bg-[#0B0C0E] shadow-xl p-3 py-0 min-h-screen">
                {/* breadcrumb */}
                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li>
                            <a
                                onClick={() => navigate("/")}
                                className="no-underline hover:no-underline hover:text-bread"
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a className="text-bread no-underline hover:no-underline">
                                Client
                            </a>
                        </li>
                    </ul>
                </div>
                {/* title & filter/searching section */}
                <div className="my-1 mb-4 flex flex-col gap-1">
                    <div className="flex flex-row justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                                Clients
                            </h1>
                        </div>
                        <div className="">
                            <Button
                                modal={() => setSelectedClient({})}
                                bg="bg-rose-500"
                                hoverBg="hover:bg-rose-600"
                                logo={<IoIosPeople />}
                                text="Client"
                                tip="Add Client"
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex flex-col md:flex-row gap-3 md:items-center justify-between">
                        <SearchBox
                            placeholders={[
                                "Client Name",
                                "Client Phone",
                                "Event Date",
                                "Client Place",
                            ]}
                            value={search}
                            onChange={(val) => {
                                setSearch(val);
                            }}
                            onSearch={(val) => {
                                setSearch(val);
                            }}
                            onClear={() => {
                                setSearch("");
                            }}
                            autoFocus={true}
                        />

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-35">
                                <select
                                    value={filterType}
                                    onChange={(e) =>
                                        setFilterType(e.target.value)
                                    }
                                    className="w-full md:w-35 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-focus"
                                >
                                    <option value="">All</option>
                                    <option value="this_month">
                                        This Month
                                    </option>
                                    <option value="last_month">
                                        Last Month
                                    </option>
                                    <option value="previous_month">
                                        Last Month - 1
                                    </option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {filterType === "custom" && (
                                <div className="flex flex-row gap-2 w-full">
                                    <input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) =>
                                            setCustomFrom(e.target.value)
                                        }
                                        className="w-full md:w-45 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-focus"
                                    />
                                    <input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) =>
                                            setCustomTo(e.target.value)
                                        }
                                        className="w-full md:w-45 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-focus"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table — with in-place loading overlay */}
                <div className="relative">
                    {/* Overlay spinner*/}
                    {tableLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl  backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-core" />
                        </div>
                    )}

                    {clients.length === 0 && !tableLoading ? (
                        <p className="grid place-items-center h-40 text-gray-400">
                            No Data to Display
                        </p>
                    ) : (
                        <div
                            className={`rounded-2xl overflow-x-auto border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16181A]/60 dark:backdrop-blur-xl transition-opacity duration-200 mb-4 ${tableLoading ? "opacity-50" : "opacity-100"}`}
                        >
                            <table className="table w-full text-center capitalize">
                                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
                                    <tr className="font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                        <th>Client Code</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Location</th>
                                        <th>Added By</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {clients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/[0.05] cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/clients/${client.id}`,
                                                )
                                            }
                                        >
                                            <td className="font-mono text-sm text-core">
                                                {client.client_code}
                                            </td>

                                            <td className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {client.name}
                                            </td>
                                            <td>{client.phone}</td>
                                            <td className="lowercase">
                                                {client.email}
                                            </td>
                                            <td>{client.place}</td>
                                            <td>
                                                {client.created_by_name ||
                                                    ". . ."}
                                            </td>
                                            <td>
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-lime-600 hover:bg-lime-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-lime-500 dark:hover:bg-lime-600 dark:hover:text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                                `/clients/${client.id}`,
                                                            );
                                                        }}
                                                    >
                                                        <FaEye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-yellow-600 hover:bg-yellow-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-yellow-500 dark:hover:bg-yellow-600 dark:hover:text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedClient(
                                                                client,
                                                            );
                                                        }}
                                                    >
                                                        <MdEdit className="h-5 w-5" />
                                                    </button>
                                                    {role === "ADMIN" && (
                                                        <button
                                                            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-gray-100 border border-gray-200 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-rose-500 dark:hover:bg-rose-600 dark:hover:text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    client.id,
                                                                );
                                                            }}
                                                        >
                                                            <MdDeleteOutline className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-8 px-2">
                        <div className="flex items-center gap-1 p-1.5 bg-white/40 dark:bg-white/[0.08] backdrop-blur-2xl rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page <= 1}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">
                                    ‹
                                </span>
                            </button>

                            <div className="flex items-center gap-1">
                                {getPaginationPages(page, totalPages).map(
                                    (p, i) =>
                                        p === "..." ? (
                                            <span
                                                key={`ellipsis-${i}`}
                                                className="w-8 text-center text-gray-400 dark:text-white/30 text-xs"
                                            >
                                                •••
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                                                ${page === p ? "text-white scale-110" : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/10"}`}
                                            >
                                                {page === p && (
                                                    <div className="absolute inset-0 bg-core rounded-full -z-10 animate-in zoom-in duration-300" />
                                                )}
                                                {p}
                                            </button>
                                        ),
                                )}
                            </div>

                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasNext}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-white/70 hover:bg-gray-200/50 dark:hover:bg-white/10 disabled:opacity-20 transition-all duration-300 active:scale-90"
                            >
                                <span className="text-xl leading-none mb-1">
                                    ›
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {selectedClient !== null && (
                    <ClientForm
                        client={selectedClient.id ? selectedClient : null}
                        refresh={[fetchAllClients]}
                        onClose={() => setSelectedClient(null)}
                        showToast={showToast}
                    />
                )}
            </div>
        </>
    );
};

export default ListClients;

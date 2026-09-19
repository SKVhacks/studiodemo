import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetGallery, UploadGallery, DeleteGallery } from "../../api/GalleryServices";
import Toast from "../../components/Toast";
import { MdDeleteOutline, MdUpload, MdImage, MdVideocam, MdClose } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import Button from '../../components/Button'
const IMAGE_MAX_MB = 10;
const VIDEO_MAX_MB = 200;

const ViewGallery = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [allItems, setAllItems] = useState([]);      // Store all fetched items
    const [items, setItems] = useState([]);      // Store filtered items
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [category, setCategory] = useState("all");
    const [toast, setToast] = useState(null);
    const [preview, setPreview] = useState(null);
    const [galleryLoading, setGalleryLoading] = useState(false); // for grid loading state
    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        file: null, category: "image", title: "",
    });
    const [uploadError, setUploadError] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const showToast = (msg, color) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 5000);
    };
    const [previewUrl, setPreviewUrl] = useState(null);
    // Fetch all items once on component mount (no category parameter)
    const fetchGallery = async () => {
        setLoading(true);
        try {
            const res = await GetGallery();
            setAllItems(res.data);
            setItems(res.data); // Initially show all
        } catch (err) {
            console.log(err);
            showToast("Failed to load gallery", "alert-error");
        } finally {
            setLoading(false);
        }
    };

    // Fetch gallery only once on component mount
    useEffect(() => {
        fetchGallery();
    }, []);

    // Filter items when category changes (frontend filtering - NO API CALL)
    useEffect(() => {
        setGalleryLoading(true);
        const timer = setTimeout(() => {
            if (category === "all") {
                setItems(allItems);
            } else {
                setItems(allItems.filter(item => item.category === category));
            }
            setGalleryLoading(false);
        }, 150);
        return () => clearTimeout(timer);
    }, [category, allItems]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadError("");
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
            setUploadError("Only image or video files are allowed.");
            return;
        }
        const cat = isImage ? "image" : "video";
        const maxMB = isImage ? IMAGE_MAX_MB : VIDEO_MAX_MB;
        const maxBytes = maxMB * 1024 * 1024;
        if (file.size > maxBytes) {
            setUploadError(`${cat === "image" ? "Image" : "Video"} must be ≤ ${maxMB} MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
            return;
        }
        setUploadForm(f => ({ ...f, file, category: cat }));
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!uploadForm.file) {
            setUploadError("Please select a file.");
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadForm.file);
            fd.append("category", uploadForm.category);
            fd.append("title", uploadForm.title);
            await UploadGallery(fd);
            showToast("Uploaded successfully!", "alert-success");
            setShowUpload(false);
            setUploadForm({ file: null, category: "image", title: "" });
            setUploadError("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchGallery(); // Refetch to get new item
        } catch (err) {
            const msg = err.response?.data?.file?.[0]
                || err.response?.data?.error
                || "Upload failed";
            showToast(msg, "alert-error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            await DeleteGallery(id);
            showToast("Deleted successfully.", "alert-warning");
            setAllItems(prev => prev.filter(item => item.id !== id));
        } catch {
            showToast("Failed to delete.", "alert-error");
        } finally {
            setDeletingId(null);
        }
    };

    const fmtSize = (bytes) => {
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#F5F5F7] dark:bg-[#000000]">
            <span className="loading loading-spinner w-8 lg:w-10 text-core" />
        </div>
    );

    return (
        <>
            {toast && <Toast msg={toast.msg} color={toast.color} />}
            {preview && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-300"
                    onClick={() => setPreview(null)}
                >
                    <button
                        className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white transition active:scale-95"
                        onClick={() => setPreview(null)}
                    >
                        <MdClose className="text-2xl" />
                    </button>
                    <div onClick={e => e.stopPropagation()} className="p-4 max-w-[95vw] max-h-[90vh]">
                        {preview.type === "image" ? (
                            <img
                                src={preview.url}
                                alt="preview"
                                className="max-w-full max-h-[85vh] rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] object-contain"
                            />
                        ) : (
                            <video
                                src={preview.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[85vh] rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="mx-auto bg-[#F5F5F7] dark:bg-[#000000] p-3 py-0 min-h-screen font-sans antialiased tracking-tight transition-colors duration-300">

                {/* Minimalist Navigation Trail */}
                <div className="breadcrumbs text-xs font-normal">
                    <ul>
                        <li><a onClick={() => navigate('/')} className='no-underline hover:no-underline hover:text-bread'>Home</a></li>
                        <li><a className='text-bread no-underline hover:no-underline'>Gallery</a></li>
                    </ul>
                </div>

                {/* Clean Structural Toolbar Header */}
                <div className="flex flex-row sm:items-baseline justify-between gap-4 mb-2 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">Gallery</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-normal tracking-wide">
                            {items.length} {category === "all" ? "media files" : category + " files"} available
                        </p>
                    </div>
                    <div className="mt-1.5 md:mt-0">
                        <Button modal={() => setShowUpload(true)} bg="bg-rose-500" hoverBg="hover:bg-rose-600" logo={<MdUpload />} text="Upload" />
                    </div>
                </div>

                {/* Segmented Control Filter Tabs */}
                <div className="inline-flex p-0.5 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/50  border border-neutral-200/20 dark:border-neutral-800/20">
                    {["all", "image", "video"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCategory(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${category === tab
                                ? "bg-core text-white shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-core/70"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="my-5 text- text-center text-red-500 font-semibold text-md">
                <p>“This image / video will appear on your website’s landing page. You can manage it from here”</p>
            </div>

                {/* Grid Layout Container */}
                <div className="relative">
                    {galleryLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-sm">
                            <span className="loading loading-spinner w-7 text-core" />
                        </div>
                    )}
                    {items.length === 0 && !galleryLoading ? (
                        <div className=" flex flex-col items-center justify-center py-40 gap-3 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm flex items-center justify-center border border-neutral-200/40 dark:border-neutral-800/40">
                                <MdImage className="text-2xl text-neutral-400 dark:text-neutral-500" />
                            </div>
                            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-2">No items inside vault</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                                Your media repository file directory is currently  empty.
                            </p>
                        </div>
                    ) : (
                        <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className="group relative rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                    onClick={() => setPreview({ url: item.signed_url, type: item.category })}
                                >
                                    {/* Media Preview Area */}
                                    <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                                        {item.category === "image" ? (
                                            <img
                                                src={item.signed_url}
                                                alt={item.title || item.original_filename}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <video
                                                    src={item.signed_url}
                                                    className="w-full h-full object-cover opacity-80"
                                                    muted
                                                    playsInline
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-sm">
                                                        <FaPlay className="text-white text-xs ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors duration-200" />

                                        <button
                                            onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                                            disabled={deletingId === item.id}
                                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-neutral-900/80 dark:bg-white/80 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90"
                                        >
                                            {deletingId === item.id
                                                ? <span className="loading loading-spinner loading-xs text-core" />
                                                : <MdDeleteOutline className="text-sm" />
                                            }
                                        </button>
                                    </div>
                                    {/* Bottom Info Footer — clean card style like Image 1 */}
                                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none px-2.5 py-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                                        {/* Type badge */}
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/15 text-white backdrop-blur-sm border border-white/10 mb-1.5">
                                            {item.category === "image"
                                                ? <MdImage className="text-xs" />
                                                : <MdVideocam className="text-xs" />}
                                            {item.category}
                                        </span>

                                        {/* Title */}
                                        <p className="text-[11px] font-semibold text-white truncate leading-tight drop-shadow-sm">
                                            {item.title || item.original_filename}
                                        </p>

                                        {/* File size */}
                                        <p className="text-[10px] font-medium text-white/60 mt-0.5 tracking-wide">
                                            {fmtSize(item.file_size)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Apple Glassmorphic Upload Overlay sheets ── */}
            {showUpload && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all"
                    onClick={() => setShowUpload(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/60 shadow-[0_30px_70px_rgba(0,0,0,0.3)] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="p-6 space-y-5">
                            {/* Form Input fields */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold tracking-wide uppercase text-neutral-400 dark:text-neutral-500">Asset Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter descriptive label (optional)"
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                    className={`w-full mt-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/10 border  focus:ring-2 focus:ring-focus outline-none`}
                                />
                            </div>

                            {/* Dropzone Wrapper */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold tracking-wide uppercase text-neutral-400 dark:text-neutral-500">Attachment Source</label>
                                <div
                                    className="w-full  mt-1 min-h-36 rounded-2xl border border-2  bg-white/60 dark:bg-white/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-focus outline-none  transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                   

                                    {uploadForm.file ? (
                                        <div className="w-full">
                                            {uploadForm.category === "image" ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full max-h-56 object-contain rounded-xl"
                                                />
                                            ) : (
                                                <video
                                                    src={previewUrl}
                                                    controls
                                                    className="w-full max-h-56 rounded-xl"
                                                />
                                            )}

                                            <p className="mt-2 text-xs font-semibold truncate">
                                                {uploadForm.file.name}
                                            </p>

                                            <p className="text-[10px] text-neutral-400">
                                                {fmtSize(uploadForm.file.size)}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <MdUpload className="text-2xl text-neutral-400 mx-auto" />
                                            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                Choose file from local directory
                                            </p>
                                            <p className="text-[10px] font-medium text-neutral-400 max-w-[200px]">
                                                Images below 10MB, video streams within 200MB limit
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {uploadError && (
                                    <p className="text-[11px] font-medium text-red-500 mt-1">{uploadError}</p>
                                )}
                            </div>


                            {/* System Action Controls */}
                            <div className="flex gap-3 pt-2 items-center justify-end">
                                <button
                                    onClick={() => {
                                        setUploadForm({
                                            file: null,
                                            category: "image",
                                            title: "",
                                        });
                                        setShowUpload(false);a
                                        setUploadError("");
                                    }}
                                    disabled={uploading}
                                    className="px-4 py-2 rounded-xl text-sm bg-zinc-200 dark:bg-zinc-700 font-medium  disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !!uploadError || !uploadForm.file}
                                    className={` ${uploading || !!uploadError || !uploadForm.file ? "opacity-60" : "hover:scale-105"} px-5 py-2 rounded-xl text-sm text-white  bg-submit   transition font-medium disabled:cursor-not-allowed`}
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="loading loading-spinner loading-xs" /> Uploading...
                                        </span>
                                    ) : "Upload"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewGallery;
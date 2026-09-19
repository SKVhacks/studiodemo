import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientForm from './clients/ClientForm'
import { ChooseClient } from '../api/ClientServices'
import AddEventModal from './Events/AddEventModal'
import EventCalendar from './Calender/EventCalender'
import UpcomingEventsTable from '../components/UpcomingEvents'
import Toast from '../components/Toast'
import { UpcomingEvents } from '../api/EventServices'
import Button from '../components/Button';
import { TbCameraPlus } from 'react-icons/tb'
import { LucideUserRoundPlus } from 'lucide-react'
import { useLocation } from "react-router-dom";
export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addClient, setAddClient] = useState(null); // Changed SetModel to setModel (camelCase is standard)
  const [showModalEvent, setShowModalEvent] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const itemRefs = useRef([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [toast, setToast] = useState(null);
  const showToast = (msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 5000);
  }
  const [events, setEvents] = useState([]);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const UpComingEvents = async () => {

    try {
      setLoading(true);
      const temp = await UpcomingEvents();
      setEvents(temp.data.results);
    } catch (err) {
      console.log(err);
      setEvents({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    UpComingEvents();
  }, []);

  const searchClients = async (value) => {
    setClientSearch(value);
    if (value.length < 2) { setClients([]); return; }
    try {
      const res = await ChooseClient(value);
      setClients(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setClientSearch("");
        setClients([]);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (!clients.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < clients.length - 1 ? prev + 1 : 0
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : clients.length - 1
      );
    }
    if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        navigate(`/clients/${clients[selectedIndex].id}`);
      }
    }
  };
  useEffect(() => {
    if (location.state?.toast) {
      showToast(
        location.state.toast.msg,
        location.state.toast.color
      );

      window.history.replaceState({}, document.title);
    }
  }, []);
  return (
    <>
      {toast && (
        <div>
          <Toast msg={toast.msg} color={toast.color} />
        </div>
      )}
      <div className="p-3 bg-[#F5F5F7] dark:bg-[#000000] min-h-screen max-w-screen ">

        <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-2 sm:grid-rows-2 xl:grid-cols-3 xl:grid-rows-1">

          {/* Breadcrumb — top-left on small, left on large */}
          <div className="col-span-1 flex justify-start">
            <div className="breadcrumbs text-xs font-normal">
              <ul>
                <li><a className='text-bread no-underline hover:no-underline'>Home {'>'}</a></li>
              </ul>
            </div>
          </div>

          {/* Buttons — top-right on small, right on large */}
          <div className="col-span-1 flex justify-end xl:order-last gap-3 flex-wrap">
            <Button modal={() => setAddClient({})} bg="bg-rose-500" hoverBg="hover:bg-rose-600" logo={<LucideUserRoundPlus />} text="Client" />
            <Button modal={() => setShowModalEvent(true)} bg="bg-lime-500" hoverBg="hover:bg-lime-600" logo={<TbCameraPlus />} text="Event" />
          </div>

          {/* Search — bottom-center on small, center on large */}
          <div ref={searchRef} className="col-span-2 flex justify-center xl:col-span-1 xl:order-none">
            <div className="form-control w-full max-w-md relative">
              <div className="relative flex items-center">
                <svg
                  className="absolute left-3.5 w-4 h-4 text-base-content/30 pointer-events-none"
                  viewBox="0 0 16 16" fill="none"
                >
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by name, phone..."
                  className="w-full pl-10 pr-20 py-3 rounded-xl bg-white/85 dark:bg-white/15 border border-base-300 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:ring-2 focus:ring-focus  focus:border-none transition-all duration-150"
                  value={clientSearch}
                  onChange={(e) => searchClients(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {!clientSearch && (
                  <span className="absolute right-3 top-3 text-xs tooltip" data-tip="cmd + k">
                    <kbd className="kbd">⌘K</kbd>
                  </span>
                )}
                {clientSearch && (
                  <button
                    className="absolute right-3 w-5 h-5 rounded-full bg-base-content/15 hover:bg-base-content/25 flex items-center justify-center transition-colors duration-100"
                    onClick={() => { searchClients(""); inputRef.current?.focus(); }}
                    tabIndex={-1}
                  >
                    <svg className="w-2.5 h-2.5 text-base-content/60" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>

              {clientSearch.length > 1 && (
                <ul className="absolute w-full mt-3 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl max-h-72 overflow-y-auto z-10">
                  {clients.length > 0 ? (
                    clients.map((c, index) => (
                      <li
                        key={c.id}
                        ref={(el) => (itemRefs.current[index] = el)}
                        onClick={() => navigate(`/clients/${c.id}`)}
                        className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-all duration-200 rounded-xl mx-2 my-1 ${selectedIndex === index ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-white/10"}`}
                      >
                        <p className="font-semibold text-base truncate capitalize">
                          {c.name}
                          <span className="opacity-50 text-sm"> {c.phone}</span>
                        </p>
                        <p className={`text-sm ${selectedIndex === index ? "text-white" : "text-core"} ml-2 flex-shrink-0 capitalize`}>
                          {c.place}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-center">
                      <p className="text-sm opacity-60 mb-3">No client found</p>
                      <div className='flex flex-row justify-center'>
                        <Button modal={() => { setAddClient({}) }} bg="bg-rose-500" hoverBg="hover:bg-rose-600" logo={<LucideUserRoundPlus />} text={`"${clientSearch}"`} />
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:mt-2">
          <div className="xl:col-span-3">
            <UpcomingEventsTable events={events} loading={loading} />
          </div>
          <div className="xl:col-span-2">
            <EventCalendar refreshKey={calendarRefreshKey} />
          </div>
        </div>
        {
          addClient !== null && (
            <ClientForm
              showToast={showToast}
              client={null}
              refresh={[UpComingEvents]}
              onClose={() => setAddClient(null)}
            />
          )
        }
        {showModalEvent && (
          <AddEventModal
            showToast={showToast}
            fetchEvents={[UpComingEvents, () => setCalendarRefreshKey(k => k + 1)]}
            setShowModalEvent={setShowModalEvent}
          />
        )}
      </div>

    </>
  )
}
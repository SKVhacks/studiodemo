import { IoIosPeople } from "react-icons/io";
import { TiCamera } from "react-icons/ti";
import { FaClockRotateLeft, FaArrowTrendUp, } from "react-icons/fa6";
import { fmtRupee , fmtNum } from './converter';

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHSFull = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
export const KPI_META = [
  { key: "total_clients", label: "Total Clients", icon: IoIosPeople, fmt: fmtNum  },
  { key: "total_events", label: "Total Events", icon: TiCamera, fmt: fmtNum  },
  { key: "total_revenue", label: "Total Revenue", icon: FaArrowTrendUp, fmt: fmtRupee  },
  { key: "pending_amount", label: "Pending Amount", icon: FaClockRotateLeft, fmt: fmtRupee  },
];

export const CUR_YEAR = new Date().getFullYear();

export const CUR_MONTH = new Date().getMonth() + 1;

export const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const MONTH_OPTIONS = [
    { value: 0, label: "All Months" },
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" },
];
export const STATUS_COLORS = {
    scheduled: "#F59E0B",
    shouted: "#8B5CF6",
    processing: "#3B82F6",
    completed: "#22C55E",
    cancelled: "#EF4444",
};
export const PAYMENT_COLORS = { paid: "#4CAF7D", partial: "#C9A84C", pending: "#E05C5C" };
export const DONUT_COLORS = ["#4CAF7D", "#E05C5C"];


// Step title & subtitle config
export const stepConfig = {
  EMAIL:              { title: "Welcome back",         sub: "Enter your email to continue" },
  PASSWORD:           { title: "Enter Password",       sub: "Use your account password to sign in" },
  OTP:                { title: "Check your inbox",     sub: "We sent a 6-digit code to your email" },
  SET_PASSWORD:       { title: "Create a Password",    sub: "Choose a strong password for your account" },
  FORGOT_OTP:         { title: "Verify your identity", sub: "Enter the 6-digit code sent to your email" },
  FORGOT_SET_PASSWORD:{ title: "New Password",         sub: "Set a new secure password for your account" },
};

export const monthStatsData =[
  {title:"Clients"},
  {title:"Events"},
  {title:"Paid"},
  {title:"Unpaid"},
];
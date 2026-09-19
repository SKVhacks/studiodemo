import React from 'react';
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

const StatCard = ({ title, value, trend, isUp, Icon, tooltip, ListData = [] }) => {
  return (
    /* DaisyUI 'card' class handles basic padding and radius */
    <div className="card w-full bg-base-100 dark:bg-zinc-900 shadow-sm border border-base-300  dark:border-zinc-800 transition-all hover:shadow-md">
      <div className="card-body p-6">
        {/* Header: Icon & Sparkline */}
        <div className="flex items-start justify-between ">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl dark:bg-zinc-800 bg-zinc-100  text-primary">
            <Icon className="text-5xl text-core" />
          </div>

          {/* Sparkline Container - Adjusted for dark mode compatibility */}
          <div className="relative  h-20 w-45 ">
            <SparkLineChart
              data={ListData}
              curve="natural"
              area
              showTooltip={true}
              showHighlight={true}
              sx={{
                '& .MuiAreaElement-root': {
                  fill: 'url(#paint0_linear)',
                  fillOpacity: 0.5,
                },
                '& .MuiLineElement-root': {
                  strokeWidth: 3,
                  stroke: '#ffb900'
                },
                '& .MuiHighlightElement-root': {
                  fill: '#ffb900',       // dot fill color
                  stroke: '#ffb900',     
                  r: 4,                  
                },
                
              }}
              slotProps={{
                popper: { sx: { pointerEvents: 'none' } }
              }}
              

            >

              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb900" stopOpacity={1} />
                  <stop offset="90%" stopColor="#ffb900" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </SparkLineChart>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1 ">
          <p className="text-sm font-medium  uppercase tracking-wider">{title}</p>

          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-base-content tooltip tooltip-bottom" data-tip={tooltip}>
              {value}
            </h2>


            <div className={`flex items-center gap-1 rounded-full px-2.5 py-2 text-xs font-bold ${isUp ? 'bg-emerald-100 text-emerald-600 dark:text-white dark:bg-green-600' : 'bg-rose-100 text-rose-600 dark:text-white dark:bg-red-600'
              }`}>
              {isUp ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
              <span>{Math.abs(trend)}%</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StatCard;

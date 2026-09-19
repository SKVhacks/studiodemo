import React from 'react'
import { PieChart } from "@mui/x-charts/PieChart";
const GRID_COLOR = "#374151"; 
const TOOLTIP_SX = {
    "& .MuiChartsTooltip-paper": {
        background: "#1f2937 !important",
        border: `1px solid ${GRID_COLOR} !important`,
        borderRadius: "10px !important",
        boxShadow: "none !important",
    },
    "& .MuiChartsTooltip-labelCell, & .MuiChartsTooltip-valueCell": {
        color: "#f5f5f5 !important",
        fontSize: "12px !important",
    },
};

const ChartPie = ({eventPieData}) => {
    if (eventPieData.length == 0) return <p className='text-base-content text-center'>No data</p>;

    return (
        <PieChart
            height={260}
            series={[{
                data: eventPieData,
                innerRadius: 0,
                outerRadius: 120,
                paddingAngle: 2,
                cornerRadius: 4,
                highlightScope: { fade: "global", highlight: "item" },
                valueFormatter: (v) => `${v.value} events`,
            }]}
            sx={TOOLTIP_SX}
            slotProps={{
                legend: {
                    hidden: true,
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: { top: 8 },
                },
            }}
        />
    )
}

export default ChartPie
import React from 'react'
import { PieChart } from "@mui/x-charts/PieChart";
import { fmtRupee } from '../../../helpers/converter'
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
const ChartDonut = ({ revDonutData }) => {
    if (revDonutData[0]?.value == 0 && revDonutData[1]?.value == 0) return <p className='text-base-content text-center'>No data</p>;
    return (
        <>
            <PieChart
                height={260}
                series={[{
                    data: revDonutData,
                    innerRadius: 82,
                    outerRadius: 125,
                    paddingAngle: 3,
                    cornerRadius: 4,
                    highlightScope: { fade: "global", highlight: "item" },
                    valueFormatter: (v) => fmtRupee(v.value),
                }]}
                sx={TOOLTIP_SX}
                slotProps={{ legend: { hidden: true } }}
            />
        </>
    )
}

export default ChartDonut
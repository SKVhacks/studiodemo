import StatCard from '../../../components/StatCard';
import { KPI_META } from '../../../helpers/data';


function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="min-w-md bg-base-200 border border-base-300 rounded-2xl h-32 animate-pulse" />
      ))}
    </div>
     
  );
}

export default function KPICard({ data , value}) {
  if (!data) return <KPISkeleton />;
  return (
    <>
      {KPI_META.map(({ key, label, icon, fmt }, i) => {
        const stat = data[key] ?? {};
        const pct = stat.change_pct ?? 0;
        return (
          <StatCard
            key={key}
            title={label}
            value={fmt(stat.value ?? 0)}
            trend={pct}
            isUp={pct >= 0 ? true : false}
            Icon={icon}
            tooltip={stat.value}
            ListData={value[i]}
          />
        );
      })}
    </>
  );
}

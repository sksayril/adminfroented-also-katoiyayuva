interface BarChartProps {
  data: { month: string; value: number }[];
}

export default function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between h-48 space-x-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center justify-end">
          <div
            className="w-full bg-blue-400 rounded-t transition-all hover:bg-blue-500"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

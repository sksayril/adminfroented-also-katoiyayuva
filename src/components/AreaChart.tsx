interface AreaChartProps {
  data: { date: string; value: number }[];
}

export default function AreaChart({ data }: AreaChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M 0,100 L ${points} L 100,100 Z`;

  return (
    <div className="relative w-full h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d={pathD} fill="url(#areaGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
        <span>Oct 22</span>
        <span>Oct 25</span>
        <span>Oct 28</span>
        <span>Oct 31</span>
        <span>Nov</span>
        <span>Nov 06</span>
        <span>Nov 09</span>
        <span>Nov 12</span>
        <span>Nov 15</span>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { month: string; value: number }[];
}

export default function LineChart({ data }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 80;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="white"
            />
          );
        })}
      </svg>
    </div>
  );
}

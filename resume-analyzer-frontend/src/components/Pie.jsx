import React, { useEffect, useState } from "react";

const cleanPercentage = (percentage) => {
  const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0;
  const isTooHigh = percentage > 100;
  return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage;
};

const Circle = ({ colour, percentage }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const strokePct = (percentage * circ) / 100;

  return (
    <circle
      r={r}
      cx={100}
      cy={100}
      fill="transparent"
      stroke={colour}
      strokeWidth={"2rem"}
      strokeDasharray={circ}
      strokeDashoffset={circ - strokePct}
      style={{
        transition: "stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    ></circle>
  );
};

const Text = ({ percentage }) => (
  <text
    x="50%"
    y="50%"
    dominantBaseline="central"
    textAnchor="middle"
    fontSize={"1.5em"}
    fill="#222"
  >
    {percentage.toFixed(0)}%
  </text>
);

const Pie = ({ percentage, colour, refreshKey }) => {
  const pct = cleanPercentage(percentage);
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    setAnimatedPct(0);
    const timeout = setTimeout(() => {
      setAnimatedPct(pct);
    }, 50);
    return () => clearTimeout(timeout);
  }, [pct, refreshKey]);

  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ display: "block" }}>
      <defs>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00c6ff" />
          <stop offset="100%" stopColor="#0072ff" />
        </linearGradient>
      </defs>
      <g transform={`rotate(-90 100 100)`}>
        <Circle colour="#e6e6e6" percentage={100} />
        <Circle colour="url(#liquidGradient)" percentage={animatedPct} />
      </g>
      <Text percentage={animatedPct} />
    </svg>
  );
};

export default Pie;

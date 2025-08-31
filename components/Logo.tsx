import React from 'react';

type LogoProps = {
  size?: number;
  className?: string;
};

/**
  Simple logo component approximating a Q letter followed by a pie chart.
 */
export default function Logo({ size = 64, className = '' }: LogoProps) {
  const dimension = `${size}`;
  const dark = '#14546F';
  const muted = '#6B8DA6';

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 68 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Letter Q */}
      <text
        x="4"
        y="48"
        fontSize="40"
        fontWeight="bold"
        fill="#111827"
        fontFamily="sans-serif"
      >
        Q...
      </text>
      {/* Outer pie outline */}
      <circle
        cx="48"
        cy="24"
        r="16"
        stroke={muted}
        strokeWidth="4"
        fill="none"
      />
      {/* Wedge */}
      <path
        d="M48 24 L48 8 A16 16 0 0 1 64 24 Z"
        fill={muted}
      />
      {/* Small wedge accent */}
      <path
        d="M48 24 L64 24 A16 16 0 0 1 60.97 15 Z"
        fill={dark}
      />
    </svg>
  );
}
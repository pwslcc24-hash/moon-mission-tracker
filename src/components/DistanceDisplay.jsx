import { formatNumber } from "../lib/missionData";

export const KM_TO_MILES = 0.621371;

export function kmToMiles(km) {
  return Math.round(km * KM_TO_MILES);
}

/**
 * Renders a distance with miles as primary and km as secondary.
 * @param {number} km - distance in kilometers
 * @param {string} [className] - optional wrapper class
 */
export default function DistanceDisplay({ km, className = "" }) {
  const miles = kmToMiles(km);
  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span className="font-bold tabular-nums">{formatNumber(miles)} mi</span>
      <span className="text-[11px] text-muted-foreground font-normal tabular-nums">
        {formatNumber(km)} km
      </span>
    </span>
  );
}
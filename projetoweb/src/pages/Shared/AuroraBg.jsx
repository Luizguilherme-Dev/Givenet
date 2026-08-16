import Aurora from "../Home/Aurora";
import "./AuroraBg.css";

const DEFAULT_STOPS = ["#7C3AED", "#7e36c0", "#5227FF"];

export default function AuroraBg({
  colorStops = DEFAULT_STOPS,
  blend = 0.5,
  amplitude = 1.0,
}) {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <Aurora colorStops={colorStops} blend={blend} amplitude={amplitude} />
    </div>
  );
}


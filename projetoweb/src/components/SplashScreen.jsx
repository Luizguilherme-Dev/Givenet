import { useState, useEffect } from "react";
import ShinyText from "../pages/Home/ShinyText";
import "./SplashScreen.css";

export default function SplashScreen({ onDone }) {
  const [fase, setFase] = useState("loading");

  useEffect(() => {
    const t = setTimeout(() => setFase("pronto"), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleEntrar = () => {
    setFase("saindo");
    setTimeout(() => onDone(), 500);
  };

  return (
    <div className={`splash-overlay ${fase === "saindo" ? "splash-saindo" : ""}`}>
      <div className="splash-content">
        <h1 className="splash-logo">
          <ShinyText
            text="GiveNet"
            color="#a855f7"
            shineColor="#ffffff"
            speed={2.5}
            spread={100}
          />
        </h1>
        {fase === "loading" && (
          <div className="splash-bar-track">
            <div className="splash-bar-fill" />
          </div>
        )}
        {fase === "pronto" && (
          <button className="splash-btn" onClick={handleEntrar}>
            Doe hoje. Transforme sempre.
          </button>
        )}
      </div>
    </div>
  );
}

import "./LogoOverlay.css";

function LogoOverlay({ opacity = 0 }) {
  return (
    <div className="logo-overlay" style={{ opacity }}>
      <div className="logo-overlay__text">
        Oysters
        <span className="logo-overlay__dot"></span>
        AI
      </div>
    </div>
  );
}

export default LogoOverlay;
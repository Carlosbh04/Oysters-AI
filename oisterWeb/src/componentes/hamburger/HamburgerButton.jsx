import "./HamburgerButton.css";

function HamburgerButton({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      className={`hamburger ${isOpen ? "active" : ""}`}
      onClick={onToggle}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={isOpen}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}

export default HamburgerButton;
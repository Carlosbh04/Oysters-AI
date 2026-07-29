import "./Dropdown.css";
import { dropdowns } from "../../data/dropdown.js";
import { RiArrowDownSLine } from "react-icons/ri";

function Dropdown({ menu }) {
  const dropdown = dropdowns[menu];

  if (!dropdown) return null;

  return (
    <div className="dropdown">
      <button type="button" className="header__link dropdown__trigger">
        <span className="dropdown__label">{dropdown.title}</span>

        <RiArrowDownSLine className="dropdown__arrow" />

        <span className="header__sparkles">
          <span className="spark sparkle-1"></span>
          <span className="spark sparkle-2"></span>
          <span className="spark sparkle-3"></span>
        </span>
      </button>

      <div className="dropdown__menu">
        <div className="dropdown__card">
          <span className="dropdown__category">{dropdown.title}</span>

          <nav className="dropdown__content">
            {dropdown.items.map((item) => (
              <a key={item.id} href={item.path} className="dropdown__item">
                <div className="dropdown__item-icon">
                  <i className="ri-arrow-right-up-line"></i>
                </div>

                <div className="dropdown__item-content">
                  <h4 className="dropdown__item-title">{item.title}</h4>

                  <p className="dropdown__item-description">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Dropdown;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";

function Navbar({ isLoggedIn, onLogout }) {
  const [tappedProfile, setTappedProfile] = useState(false);
  const [tappedItem, setTappedItem] = useState(null);
  const [tappedNav, setTappedNav] = useState(null); // new: for Home/Jobs

  const blurToggle = () => {
    const toggleBtn = document.querySelector(".profileMenu .dropdown-toggle");
    if (toggleBtn) {
      setTimeout(() => toggleBtn.blur(), 0);
    }
  };

  const triggerTapEffect = (setter, key = true, duration = 400) => {
    setter(key);
    setTimeout(() => setter(false), duration);
  };

  return (
    <nav>
      <ul>
        <li>
          <Link
            to="/"
            className={tappedNav === "home" ? "tap-active" : ""}
            onTouchStart={() => triggerTapEffect(setTappedNav, "home")}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/jobs"
            className={tappedNav === "jobs" ? "tap-active" : ""}
            onTouchStart={() => triggerTapEffect(setTappedNav, "jobs")}
          >
            Jobs
          </Link>
        </li>

        <li className="profileMenu">
          <Dropdown autoClose="true">
            <Dropdown.Toggle
              id="dropdown-basic"
              className={`profileButton${tappedProfile ? " tap-active" : ""}`}
              tabIndex="-1"
              onTouchStart={() => triggerTapEffect(setTappedProfile)}
            >
              Profile
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdownMenu">
              
              <Dropdown.Item
                as={Link}
                to="/upload"
                className={tappedItem === "upload" ? "tap-active" : ""}
                onTouchStart={() => triggerTapEffect(setTappedItem, "upload")}
                onClick={blurToggle}
              >
                Resume Upload
              </Dropdown.Item>

              {isLoggedIn ? (
                <Dropdown.Item
                  className={tappedItem === "logout" ? "tap-active" : ""}
                  onTouchStart={() => triggerTapEffect(setTappedItem, "logout")}
                  onClick={() => {
                    blurToggle();
                    onLogout();
                  }}
                >
                  Logout
                </Dropdown.Item>
              ) : (
                <Dropdown.Item
                  as={Link}
                  to="/login"
                  className={tappedItem === "login" ? "tap-active" : ""}
                  onTouchStart={() => triggerTapEffect(setTappedItem, "login")}
                  onClick={blurToggle}
                >
                  Login
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
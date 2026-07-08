import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";

function Navbar({ isLoggedIn, onLogout }) {
  const blurToggle = () => {
    const toggleBtn = document.querySelector(".profileMenu .dropdown-toggle");
    if (toggleBtn) toggleBtn.blur();
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/jobs">Jobs</Link></li>

        <li className="profileMenu">
          <Dropdown autoClose="true">
            <Dropdown.Toggle
              id="dropdown-basic"
              className="profileButton"
              tabIndex="-1"
            >
              Profile
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdownMenu">
              
              <Dropdown.Item as={Link} to="/upload" onClick={blurToggle}>
                Resume Upload
              </Dropdown.Item>

              {isLoggedIn ? (
                <Dropdown.Item
                  onClick={() => {
                    blurToggle();
                    onLogout();
                  }}
                >
                  Logout
                </Dropdown.Item>
              ) : (
                <Dropdown.Item as={Link} to="/login" onClick={blurToggle}>
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

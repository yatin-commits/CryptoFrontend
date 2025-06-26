import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faWallet, faUser, faChartSimple, faNewspaper, faSignOutAlt, faBars, faWandSparkles, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { useUser } from '../../Context/UserContext'; // Import the useUser hook to access the logout method
import {      faSignInAlt } from "@fortawesome/free-solid-svg-icons";
// import { useUser } from '../../Context/UserContext'; // Import the useUser hook

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, uid } = useUser(); // Access logout function and uid to check login state

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`bg-blue-900 fixed text-white h-screen ${isOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col`}>
      {/* Toggle Button */}
      <div className="p-4 cursor-pointer text-center text-xl hover:bg-blue-600" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col items-center">
        <MenuItem
          isOpen={isOpen}
          icon={faChartSimple}
          label="Market"
          onClick={() => navigate("/")}
        />
        <MenuItem
          isOpen={isOpen}
          icon={faUser}
          label="Portfolio"
          onClick={() => navigate("/portfolio")}
        />
        <MenuItem
          isOpen={isOpen}
          icon={faNewspaper}
          label="News"
          onClick={() => navigate("/news")}
        />
        {/* <MenuItem
          isOpen={isOpen}
          icon={faTrophy}
          label="LeaderBoard"
          onClick={() => navigate("/leaderboard")}
        /> */}
        <MenuItem
          isOpen={isOpen}
          icon={faWallet}
          label="Account"
          onClick={() => navigate("/account")}
        />
        <MenuItem
          isOpen={isOpen}
          icon={faWandSparkles}
          label="Ask AI"
          onClick={() => navigate("/askai")}
        />
        {/* <MenuItem
          isOpen={isOpen}
          icon={faSignOutAlt}
          label="Logout"
          onClick={logout} // Call the logout method
        /> */}
        

        {/* Show Login if user is not logged in, otherwise show Logout */}
        {uid ? (
          <MenuItem isOpen={isOpen} icon={faSignOutAlt} label="Logout" onClick={logout} />
        ) : (
          <MenuItem isOpen={isOpen} icon={faSignInAlt} label="Login" onClick={() => navigate("/login")} />
        )}
      </div>
    </div>
  );
};

const MenuItem = ({ isOpen, icon, label, onClick }) => {
  return (
    <div className="w-full flex items-center justify-start gap-4 p-4 hover:bg-blue-600 cursor-pointer" onClick={onClick}>
      <FontAwesomeIcon icon={icon} size="lg" className="text-xl" />
      {isOpen && <span className="text-md">{label}</span>}
    </div>
  );
};

export default Sidebar;

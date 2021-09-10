import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "./Auth";

const Header = () => {
  const authContext = useContext(AuthContext);
  if (
    authContext.isAuthenticating === false &&
    authContext.currentUser !== null &&
    authContext.userRole !== ""
  ) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          backgroundColor: "white",
          marginBottom: "20px"
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            height: "50px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <NavLink to="/myProfile" style={{ marginRight: "10px" }}>
            My Profile
          </NavLink>
        </div>
      </div>
    );
  } else return null;
};

export default Header;

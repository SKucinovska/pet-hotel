import React, { useContext, useState, useEffect } from "react";
import { Menu } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "./Auth";

const NavMenu = () => {
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["home"]);
  const location = useLocation();
  console.log(location);

  useEffect(() => {
    if (
      location.pathname === "/users" ||
      location.pathname.search("userInfo") >= 0
    )
      setSelectedKeys(["users"]);
    else if (location.pathname === "/pets") setSelectedKeys(["pets"]);
    else if (
      location.pathname === "/bookings" ||
      location.pathname.search("editBooking") >= 0
    )
      setSelectedKeys(["bookings"]);
    else if (location.pathname === "/settings") setSelectedKeys(["settings"]);
    else if (location.pathname === "/") setSelectedKeys(["home"]);
    else if (location.pathname === "/myProfile") setSelectedKeys(["home"]);
  }, [location]);

  if (
    authContext.isAuthenticating === false &&
    authContext.currentUser !== null &&
    authContext.userRole !== ""
  ) {
    console.log(authContext.userRole);
    return (
      <Menu
        onClick={event => {
          if (event.key === "users") history.push("/users");
          else if (event.key === "settings") history.push("/settings");
          else if (event.key === "pets") history.push("/pets");
          else if (event.key === "home") history.push("/");
          else history.push("/bookings");
        }}
        style={{ width: "200px", height: "100vh" }}
        selectedKeys={selectedKeys}
      >
        <Menu.Item key="home">Home</Menu.Item>
        {(authContext.userRole === "manager" ||
          authContext.userRole === "employee") && (
          <Menu.Item key="users">Users</Menu.Item>
        )}
        <Menu.Item key="pets">Pets</Menu.Item>
        <Menu.Item key="bookings">Bookings</Menu.Item>
        {authContext.userRole === "manager" && (
          <Menu.Item key="settings">Settings</Menu.Item>
        )}
      </Menu>
    );
  } else return null;
};

export default NavMenu;

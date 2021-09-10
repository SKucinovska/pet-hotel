import React, { useContext } from "react";
import { Breadcrumb } from "antd";
import { useLocation, Link } from "react-router-dom";
import { AuthContext } from "./Auth";

const BreadcrumbArray = () => {
  const location = useLocation();
  console.log(location);
  let userId = undefined;
  let bookingId = undefined;
  if (location.pathname.search("editBooking") >= 0) {
    bookingId = location.pathname.substring(13);
  } else if (location.pathname.search("userInfo") >= 0) {
    userId = location.pathname.substring(10);
  }
  const authContext = useContext(AuthContext);

  console.log(`userId: ${userId}`);
  console.log(`bookingId: ${bookingId}`);
  if (
    authContext.isAuthenticating === false &&
    authContext.currentUser !== null &&
    authContext.userRole !== ""
  ) {
    return (
      <div
        style={{
          height: "20px",
          marginLeft: "20px",
          marginBottom: "10px",
          width: "fit-content"
        }}
      >
        {location.pathname === "/" && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {location.pathname === "/users" && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {location.pathname === "/pets" && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/pets">Pets</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {location.pathname === "/bookings" && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/bookings">Bookings</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {location.pathname === "/settings" && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/settings">Settings</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {userId && location.pathname === `/userInfo/${userId}` && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/users">Users</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/userInfo/:userId">User Info</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {bookingId && location.pathname === `/editBooking/${bookingId}` && (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/bookings">Bookings</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/editBooking/:bookingId">Edit Booking</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      </div>
    );
  } else return null;
};

export default BreadcrumbArray;

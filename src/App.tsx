import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import { AuthProvider } from "./components/Auth";
import PrivateRoute from "./components/PrivateRoute";
import Users from "./components/Users";
import Settings from "./components/Settings";
import Pets from "./components/Pets";
import Bookings from "./components/Bookings";
import MyProfile from "./components/MyProfile";
import "./App.less";
import NavMenu from "./components/NavMenu";
import Header from "./components/Header";
import BreadcrumbArray from "./components/BreadcrumbArray";
import UserInfo from "./components/UserInfo";
import EditBooking from "./components/EditBooking";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/signIn">
            <SignIn />
          </Route>
          <Route path="/signUp">
            <SignUp />
          </Route>
          <div style={{ display: "flex" }}>
            <NavMenu />
            <div style={{ flexGrow: 1 }}>
              <Header />
              <BreadcrumbArray />
              <PrivateRoute exact path="/" component={Home} />
              <Route path="/users">
                <Users />
              </Route>
              <Route path="/userInfo/:userId">
                <UserInfo />
              </Route>
              <Route path="/editBooking/:bookingId">
                <EditBooking />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/pets">
                <Pets />
              </Route>
              <Route path="/bookings">
                <Bookings />
              </Route>
              <Route path="/myProfile">
                <MyProfile />
              </Route>
            </div>
          </div>
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React, { useContext } from "react";
import { AuthContext } from "./Auth";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = (props: {
  component: () => JSX.Element;
  exact: boolean;
  path: string;
}) => {
  console.log("Private route");
  const authContext = useContext(AuthContext);
  if (authContext.isAuthenticating === false) {
    return authContext.currentUser !== null ? (
      <Route
        exact={props.exact}
        path={props.path}
        component={props.component}
      />
    ) : (
      <Redirect to="/signIn" />
    );
  } else {
    return null;
  }
};

export default PrivateRoute;

import React, { useState, useEffect } from "react";
import firebase, { auth, db } from "../firebase";

export const AuthContext = React.createContext<{
  currentUser: firebase.User | null;
  isAuthenticating: boolean;
  userRole: string;
}>({ currentUser: null, isAuthenticating: true, userRole: "" });

export const AuthProvider = (props: { children: any }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("");
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      console.log("authentication status changed");
      setCurrentUser(user);
      setIsAuthenticating(false);
    });
  }, []);
  if (currentUser !== null) {
    const currentUserId = currentUser.uid;
    db.collection("users")
      .doc(currentUserId)
      .get()
      .then(doc => {
        const docData = doc.data();
        if (docData) setUserRole(docData.role);
      });
  }
  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticating, userRole }}>
      {props.children}
    </AuthContext.Provider>
  );
};

import React, { useContext, useEffect, useState } from "react";
import { Button, Input, Form } from "antd";
import { auth, db } from "../firebase";
import { useHistory } from "react-router";
import { AuthContext } from "./Auth";
import { useForm } from "react-hook-form";

const MyProfile = () => {
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const [userName, setUserName] = useState<string>("");
  const { register, handleSubmit } = useForm();
  const [isUpdateEmailVisible, setIsUpdateEmailVisible] =
    useState<boolean>(false);
  const [isUpdatePasswordVisible, setIsUpdatePasswordVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (authContext.currentUser) {
      db.collection("users")
        .doc(authContext.currentUser.uid)
        .get()
        .then(doc => {
          const docData = doc.data();
          if (docData) {
            const firstName = docData?.firstName;
            const lastName = docData?.lastName;
            setUserName(`${firstName} ${lastName}`);
          }
        });
    }
  }, [authContext]);

  const updateEmail = (data: any) => {
    console.log(data);
    db.collection("users").doc(authContext.currentUser?.uid).update({
      email: data.newEmail
    });
    auth.currentUser
      ?.updateEmail(data.newEmail)
      .then(() => {
        alert("Email successfully updated.");
        auth.signOut();
        history.push("/signIn");
      })
      .catch(error => {
        alert(`An error occured: ${error}`);
      });
  };

  const updatePassword = (data: any) => {
    auth.currentUser
      ?.updatePassword(data.newPassword)
      .then(() => {
        alert("Password successfully updated.");
        auth.signOut();
        history.push("/signIn");
      })
      .catch(error => {
        alert(`An error occured: ${error}`);
      });
  };

  const layout = {
    labelCol: {
      span: 2
    },
    wrapperCol: {
      span: 9
    }
  };

  return (
    <div
      style={{
        marginLeft: "20px",
        marginRight: "20px",
        height: "80vh",
        backgroundColor: "white",
        padding: "20px"
      }}
    >
      <h1>User Profile</h1>
      <div style={{ marginBottom: "25px" }}>
        <h3>Profile Info</h3>
        {authContext.currentUser ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>User name: {userName}</span>
            <span>User email: {authContext.currentUser.email}</span>
          </div>
        ) : (
          <></>
        )}
      </div>

      <div>
        <h3>Edit Profile</h3>
        <div style={{ marginBottom: "10px" }}>
          <Button
            style={{ marginRight: "10px" }}
            onClick={() => {
              setIsUpdateEmailVisible(true);
            }}
          >
            Update email
          </Button>
          <Button
            onClick={() => {
              setIsUpdatePasswordVisible(true);
            }}
          >
            Update password
          </Button>
        </div>

        {isUpdateEmailVisible && (
          <Form onFinish={handleSubmit(updateEmail)} {...layout}>
            <Form.Item label={"New email"} labelAlign="left">
              <Input
                type="email"
                {...register("newEmail", { required: true })}
              />
            </Form.Item>
            <Button htmlType="submit" type="primary">
              Edit profile
            </Button>
          </Form>
        )}
        {isUpdatePasswordVisible && (
          <Form onFinish={handleSubmit(updatePassword)} {...layout}>
            <Form.Item label={"New password"} labelAlign="left">
              <Input.Password
                visibilityToggle={true}
                {...register("newPassword")}
              />
            </Form.Item>
            <Button htmlType="submit" type="primary">
              Edit Profile
            </Button>
          </Form>
        )}
      </div>

      <div style={{ marginTop: "25px" }}>
        <h3>Sign Out</h3>
        <Button
          onClick={() => {
            auth.signOut();
            history.push("/signIn");
          }}
          type="primary"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default MyProfile;

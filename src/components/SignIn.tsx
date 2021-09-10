import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, Redirect, useHistory } from "react-router-dom";
import { AuthContext } from "./Auth";
import { auth } from "../firebase";
import { Form, Input, Button, Card, Image } from "antd";

const SignIn = () => {
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const autContext = useContext(AuthContext);
  if (autContext.currentUser) {
    return <Redirect to="/" />;
  }
  const submitForm = async (values: any) => {
    try {
      await auth.signInWithEmailAndPassword(values.email, values.password);
      history.push("/");
    } catch (error) {
      alert(error);
    }
  };

  const layout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 20
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "500px"
        }}
      >
        <Image
          src={"logo.jpg"}
          style={{ height: "140px", width: "140px" }}
        ></Image>
        <h1 style={{ margin: 0 }}>Pet Hotel</h1>
        <Card
          title={"Sign in to your account"}
          style={{
            width: "100%",
            marginTop: "30px"
          }}
        >
          <Form onFinish={handleSubmit(submitForm)} {...layout}>
            <Form.Item label={"Email"}>
              <Input type="email" {...register("email")} />
            </Form.Item>

            <Form.Item label={"Password"}>
              <Input.Password
                visibilityToggle={true}
                {...register("password")}
              />
            </Form.Item>
            <Button htmlType={"submit"} type="primary" block>
              Sign In
            </Button>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <span>
                Don't have an account? <Link to="/signUp">Create account.</Link>
              </span>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;

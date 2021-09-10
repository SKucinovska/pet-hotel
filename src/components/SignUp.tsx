import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";
import { auth, db } from "../firebase";
import { Form, Input, Button, Image, Card } from "antd";

const SignUp = () => {
  const history = useHistory();
  const { register, handleSubmit, control } = useForm();
  const submitForm = async (values: any) => {
    try {
      const userCredentials = await auth.createUserWithEmailAndPassword(
        values.email,
        values.password
      );
      db.collection("users").doc(userCredentials.user?.uid).set({
        id: userCredentials.user?.uid,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        role: "client"
      });
      history.push("/");
    } catch (error) {
      alert(error);
    }
  };

  const layout = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 19
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
          style={{ width: "100%", marginTop: "30px" }}
          title={"Create a new account"}
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
            <Form.Item label={"First Name"}>
              <Controller
                control={control}
                name={"firstName"}
                render={({ field }) => (
                  <Input
                    type="text"
                    onChange={e => {
                      field.onChange(e.target.value);
                    }}
                    value={field.value}
                  />
                )}
              />
            </Form.Item>
            <Form.Item label={"Last Name"}>
              <Controller
                control={control}
                name={"lastName"}
                render={({ field }) => (
                  <Input
                    type="text"
                    onChange={e => {
                      field.onChange(e.target.value);
                    }}
                    value={field.value}
                  />
                )}
              />
            </Form.Item>
            <Form.Item label={"Phone Number"}>
              <Controller
                control={control}
                name={"phoneNumber"}
                render={({ field }) => (
                  <Input
                    type="text"
                    onChange={e => {
                      field.onChange(e.target.value);
                    }}
                    value={field.value}
                  />
                )}
              />
            </Form.Item>
            <Button htmlType={"submit"} type={"primary"} block>
              Create Account
            </Button>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <span>
                Already have an account? <Link to="/signIn">Sign in</Link>
              </span>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;

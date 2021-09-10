import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { Form, Input, Button, Radio } from "antd";
import { useForm, Controller } from "react-hook-form";

const UserInfo = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>();
  const [inputHaveChanged, setInputHaveChanged] = useState<boolean>(false);
  const { handleSubmit, control, watch } = useForm();
  const watchPhoneNumber = watch("phoneNumber");
  const watchRole = watch("userRole");

  useEffect(() => {
    db.collection("users")
      .doc(userId)
      .get()
      .then(doc => {
        console.log(doc.data());
        setUser(doc.data());
      });
  }, [userId]);

  const submitForm = (values: any) => {
    if (user) {
      const userId = user.id;
      if (
        user.role !== values.userRole ||
        user.phoneNumber !== values.phoneNumber
      ) {
        db.collection("users")
          .doc(userId)
          .update({
            role: values.userRole,
            phoneNumber: values.phoneNumber
          })
          .then(() => {
            alert(
              "The user successfully updated. The page will reload to see changes."
            );
            window.location.reload();
          });
      }
    }
  };

  useEffect(() => {
    if (user && watchRole && watchPhoneNumber) {
      if (watchPhoneNumber !== user?.phoneNumber || watchRole !== user?.role) {
        console.log("phone number or role changed");
        setInputHaveChanged(true);
      } else {
        setInputHaveChanged(false);
      }
    }
  }, [watchRole, watchPhoneNumber, user]);

  if (user) {
    return (
      <div
        style={{
          marginLeft: "20px",
          marginRight: "20px",
          height: "80vh",
          backgroundColor: "white",
          padding: "10px"
        }}
      >
        <h1>User Info</h1>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>Email: {user.email}</div>
          <div style={{ marginBottom: "24px" }}>
            Name: {user.firstName} {user.lastName}
          </div>
        </div>
        <Form onFinish={handleSubmit(submitForm)}>
          <Form.Item label={"Phone Number"}>
            <Controller
              control={control}
              name={"phoneNumber"}
              defaultValue={user.phoneNumber}
              render={({ field }) => (
                <Input
                  type="text"
                  onChange={e => {
                    field.onChange(e.target.value);
                  }}
                  value={field.value}
                  style={{ width: "120px" }}
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Role">
            <Controller
              control={control}
              name={"userRole"}
              defaultValue={user.role}
              render={({ field }) => (
                <Radio.Group
                  onChange={e => {
                    field.onChange(e.target.value);
                  }}
                  value={field.value}
                >
                  <Radio value={"manager"}>Manager</Radio>
                  <Radio value={"client"}>Client</Radio>
                  <Radio value={"employee"}>Employee</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>
          {inputHaveChanged === true && (
            <Button htmlType={"submit"} type={"primary"} disabled={false}>
              Edit User
            </Button>
          )}
          {inputHaveChanged === false && (
            <Button htmlType={"submit"} type={"primary"} disabled={true}>
              Edit User
            </Button>
          )}
        </Form>
      </div>
    );
  } else return null;
};

export default UserInfo;

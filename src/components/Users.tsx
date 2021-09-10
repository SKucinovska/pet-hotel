import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, Input, Radio, Table, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import { db, auth } from "../firebase";
import { NavLink, useHistory } from "react-router-dom";
import { AuthContext } from "./Auth";

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const { handleSubmit, control, reset } = useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<any[]>([]);
  const [searchParameter, setSerachParameter] = useState<string>("name");
  const authContext = useContext(AuthContext);
  const history = useHistory();

  const handleClick = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const submitForm = (data: any) => {
    auth
      .createUserWithEmailAndPassword(data.email, "changeMe")
      .then(userData => {
        const userId = userData.user?.uid;
        console.log(`userId: ${userId}`);
        console.log(`first name: ${data.firstName}`);
        console.log(`last name: ${data.lastName}`);
        console.log(`email: ${data.email}`);
        console.log(`phone number: ${data.phoneNumber}`);
        console.log(`role: ${data.userRole}`);
        db.collection("users").doc(userId).set({
          id: userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          role: data.userRole
        });
      });
    reset();
    setIsModalVisible(false);
    history.push("/");
  };
  const layout = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 17
    }
  };

  useEffect(() => {
    db.collection("users").onSnapshot(snapshot => {
      let users: any[] = [];
      snapshot.forEach(doc => {
        users.push(doc.data());
      });
      console.log(users);
      setUserData(users);
    });
  }, []);

  const handleSearch = (value: string) => {
    if (searchParameter === "name") {
      const usersByName = userData.filter(
        user => `${user.firstName} ${user.lastName}` === value
      );
      setUserData(usersByName);
    } else if (searchParameter === "email") {
      const usersByEmail = userData.filter(user => user.email === value);
      setUserData(usersByEmail);
    } else if (searchParameter === "phoneNumber") {
      const usersByPhoneNumber = userData.filter(
        user => user.phoneNumber === value
      );
      setUserData(usersByPhoneNumber);
    } else if (searchParameter === "role") {
      const usersByRole = userData.filter(user => user.role === value);
      setUserData(usersByRole);
    }
  };

  const refreshTableData = async () => {
    db.collection("users")
      .get()
      .then(data => {
        let users: any[] = [];
        data.docs.forEach(doc => {
          users.push(doc.data());
        });

        setUserData(users);
      });
  };

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
      <h1>Users</h1>
      <Button
        onClick={handleClick}
        type={"primary"}
        style={{ marginBottom: "10px" }}
      >
        Add user
      </Button>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
          <span style={{ marginRight: 10 }}>Search users by:</span>
          <Select
            defaultValue="name"
            style={{ width: 120 }}
            onChange={value => {
              console.log(value);
              setSerachParameter(value);
            }}
          >
            <Option value="name">Name</Option>
            <Option value="email">Email</Option>
            <Option value="phoneNumber">Phone Number</Option>
            <Option value="role">Role</Option>
          </Select>
        </div>
        <Search placeholder="Search..." onSearch={handleSearch} enterButton />
      </div>

      <Table
        dataSource={userData}
        pagination={{ pageSize: 5, defaultCurrent: 1 }}
      >
        <Table.Column
          title={<Button onClick={refreshTableData}>Refresh</Button>}
          width={2}
        />
        <Table.Column
          title={"Name"}
          render={user => (
            <NavLink to={`userInfo/${user.id}`}>
              {user.firstName} {user.lastName}
            </NavLink>
          )}
        />
        <Table.Column
          title="Email"
          render={user => <span>{user.email}</span>}
        />
        <Table.Column
          title="Phone Number"
          render={user => <span>{user.phoneNumber}</span>}
        />
        <Table.Column title="Role" render={user => <span>{user.role}</span>} />
        <Table.Column
          title="Action"
          render={user => (
            <div
              style={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <NavLink to={`userInfo/${user.id}`}>Edit</NavLink>
              {authContext.userRole === "manager" && (
                <div
                  onClick={() => {
                    db.collection("pets")
                      .where("ownerId", "==", user.id)
                      .get()
                      .then(data => {
                        let petsByOwner: any[] = [];
                        data.docs.forEach(doc => {
                          petsByOwner.push(doc.data());
                        });
                        if (petsByOwner.length === 0) {
                          db.collection("users").doc(user.id).delete();
                        } else {
                          console.log("User can not be deleted");
                          alert(
                            "User cannot be deleted. First delete this user pets."
                          );
                        }
                      });
                  }}
                  style={{ color: "#14a79d", marginLeft: "5px" }}
                >
                  Delete
                </div>
              )}
            </div>
          )}
        />
      </Table>

      <Modal
        title={"Add new user"}
        visible={isModalVisible}
        footer={null}
        closable={false}
      >
        <Form onFinish={handleSubmit(submitForm)} {...layout}>
          <Form.Item label={"Email"}>
            <Controller
              control={control}
              name={"email"}
              render={({ field }) => (
                <Input
                  type="email"
                  onChange={e => {
                    field.onChange(e.target.value);
                  }}
                  value={field.value}
                />
              )}
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
          <Form.Item label="Role">
            <Controller
              control={control}
              name={"userRole"}
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
          <Button
            htmlType={"submit"}
            type="primary"
            style={{ marginRight: "5px" }}
          >
            Submit
          </Button>
          <Button onClick={handleCancel} type="primary">
            Cancel
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

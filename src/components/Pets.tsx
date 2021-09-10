import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, Input, Table, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./Auth";

const { Search } = Input;
const { Option } = Select;

const Pets = () => {
  const { handleSubmit, control, reset } = useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<any[]>([]);
  const [petsData, setPetsData] = useState<any[]>([]);
  const [petsByUser, setPetsByUser] = useState<any[]>([]);
  const [searchParameter, setSerachParameter] = useState<string>("name");
  const authContext = useContext(AuthContext);

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

  useEffect(() => {
    db.collection("pets").onSnapshot(snapshot => {
      let pets: any[] = [];
      snapshot.forEach(doc => {
        pets.push(doc.data());
      });
      setPetsData(pets);
    });
  }, []);

  useEffect(() => {
    if (petsData.length > 0 && authContext.currentUser !== null) {
      console.log(petsData);
      console.log(authContext.currentUser.uid);
      let petsByUser: any[] = [];
      petsByUser = petsData.filter(
        pet => pet.ownerId === authContext.currentUser?.uid
      );
      setPetsByUser(petsByUser);
    }
  }, [petsData, authContext]);

  const handleClick = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const submitForm = (data: any) => {
    const petId = uuidv4();
    let ownerid: string | undefined | null = "";
    if (data.owner) {
      ownerid = data.owner;
    } else {
      ownerid = authContext.currentUser?.uid;
    }
    db.collection("pets")
      .doc(petId)
      .set({
        name: data.name,
        type: data.type,
        breed: data.breed,
        size: data.size,
        ownerId: ownerid,
        id: petId
      })
      .then(() => {
        alert("Pet successfully added");
      });
    reset();
    setIsModalVisible(false);
  };
  const layout = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 17
    }
  };

  const handleSearch = (value: string) => {
    if (searchParameter === "name") {
      const petsByName = petsData.filter(pet => pet.name === value);
      setPetsData(petsByName);
    } else if (searchParameter === "owner") {
      const firstLastName: string[] = value.split(" ");
      const firstName = firstLastName[0];
      const lastName = firstLastName[1];
      const user = userData.find(
        user => user.firstName === firstName && user.lastName === lastName
      );
      const userId = user.id;
      const petsByUser = petsData.filter(pet => pet.ownerId === userId);
      setPetsData(petsByUser);
    } else if (searchParameter === "breed") {
      const petsByBreed = petsData.filter(pet => pet.breed === value);
      setPetsData(petsByBreed);
    } else if (searchParameter === "type") {
      const petsByType = petsData.filter(pet => pet.type === value);
      setPetsData(petsByType);
    }
  };

  const refreshTableData = async () => {
    db.collection("pets")
      .get()
      .then(data => {
        let pets: any[] = [];
        data.docs.forEach(doc => {
          pets.push(doc.data());
        });

        setPetsData(pets);
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
      <h1>Pets</h1>
      <Button
        onClick={handleClick}
        type={"primary"}
        style={{ marginBottom: "10px" }}
      >
        Add pet
      </Button>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
          <span style={{ marginRight: 10 }}>Search users by:</span>
          <Select
            defaultValue="name"
            style={{ width: 120 }}
            onChange={value => {
              setSerachParameter(value);
            }}
          >
            <Option value="name">Name</Option>
            {(authContext.userRole === "manager" ||
              authContext.userRole === "employee") && (
              <Option value="owner">Owner</Option>
            )}
            <Option value="breed">Breed</Option>
            <Option value="type">Type</Option>
          </Select>
        </div>
        <Search placeholder="Search..." onSearch={handleSearch} enterButton />
      </div>

      {authContext.userRole === "manager" ||
      authContext.userRole === "employee" ? (
        <Table
          dataSource={petsData}
          pagination={{ pageSize: 5, defaultCurrent: 1 }}
        >
          <Table.Column
            title={<Button onClick={refreshTableData}>Refresh</Button>}
            width={2}
          />
          <Table.Column
            title={"Name"}
            render={pet => <span>{pet.name}</span>}
          />
          <Table.Column title="Type" render={pet => <span>{pet.type}</span>} />
          <Table.Column
            title="Breed"
            render={pet => <span>{pet.breed}</span>}
          />
          <Table.Column title="Size" render={pet => <span>{pet.size}</span>} />
          <Table.Column
            title="Owner"
            render={pet => {
              console.log(userData);
              const petOwner = userData.find(user => user.id === pet.ownerId);
              console.log(petOwner);
              return (
                <span>
                  {petOwner.firstName} {petOwner.lastName}
                </span>
              );
            }}
          />
          {authContext.userRole === "manager" && (
            <Table.Column
              title="Action"
              render={pet => (
                <div
                  onClick={() => {
                    db.collection("pets").doc(pet.id).delete();
                  }}
                  style={{ color: "#14a79d" }}
                >
                  Delete
                </div>
              )}
            />
          )}
        </Table>
      ) : (
        <Table
          dataSource={petsByUser}
          pagination={{ pageSize: 5, defaultCurrent: 1 }}
        >
          <Table.Column
            title={<Button onClick={refreshTableData}>Refresh</Button>}
            width={2}
          />
          <Table.Column
            title={"Name"}
            render={pet => <span>{pet.name}</span>}
          />
          <Table.Column title="Type" render={pet => <span>{pet.type}</span>} />
          <Table.Column
            title="Breed"
            render={pet => <span>{pet.breed}</span>}
          />
          <Table.Column title="Size" render={pet => <span>{pet.size}</span>} />
        </Table>
      )}
      <Modal
        title={"Add new pet"}
        visible={isModalVisible}
        footer={null}
        closable={false}
      >
        <Form onFinish={handleSubmit(submitForm)} {...layout}>
          <Form.Item label={"Name"}>
            <Controller
              control={control}
              name={"name"}
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
          <Form.Item label={"Type"}>
            <Controller
              control={control}
              name={"type"}
              render={({ field }) => (
                <Select
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                >
                  <Option value={"dog"}>Dog</Option>
                  <Option value={"cat"}>Cat</Option>
                </Select>
              )}
            />
          </Form.Item>
          <Form.Item label={"Breed"}>
            <Controller
              control={control}
              name={"breed"}
              render={({ field }) => (
                <Input
                  type="text"
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Size">
            <Controller
              control={control}
              name={"size"}
              render={({ field }) => {
                console.log(field);
                return (
                  <Select
                    onChange={e => {
                      field.onChange(e);
                    }}
                    value={field.value}
                  >
                    <Option value={"small"}>Small</Option>
                    <Option value={"medium"}>Medium</Option>
                    <Option value={"large"}>Large</Option>
                  </Select>
                );
              }}
            />
          </Form.Item>
          {(authContext.userRole === "manager" ||
            authContext.userRole === "employee") && (
            <Form.Item label="Owner">
              <Controller
                control={control}
                name={"owner"}
                render={({ field }) => (
                  <Select
                    onChange={e => {
                      field.onChange(e);
                    }}
                    value={field.value}
                  >
                    {userData.map(user => {
                      return (
                        <Option value={user.id}>
                          {user.firstName} {user.lastName}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              />
            </Form.Item>
          )}
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

export default Pets;

import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form, Select, DatePicker, Input, Table } from "antd";
import { useForm, Controller } from "react-hook-form";
import { db } from "../firebase";
import { AuthContext } from "./Auth";
import { v4 as uuidv4 } from "uuid";
import { NavLink } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { RangePicker } = DatePicker;

const Bookings = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm();
  const authContext = useContext(AuthContext);
  const [pets, setPets] = useState<any[]>([]);
  const [petsByOwner, setPetsByOwner] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>();
  const [totalFee, setTotalFee] = useState<number>();
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsWithPet, setBookingsWithPet] = useState<any[]>([]);
  const [bookingsByPetOwner, setBookingsByPetOwner] = useState<any[]>([]);
  const [searchParameter, setSerachParameter] = useState<string>("pet");
  const watchPeriod = watch("period");

  useEffect(() => {
    db.collection("bookings").onSnapshot(snapshot => {
      let bookings: any[] = [];
      snapshot.forEach(doc => {
        bookings.push(doc.data());
      });
      console.log(bookings);
      setBookings(bookings);
    });
  }, []);

  useEffect(() => {
    db.collection("pets")
      .get()
      .then(snapshot => {
        let pets: any[] = [];
        snapshot.docs.forEach(doc => {
          pets.push(doc.data());
        });
        console.log(pets);
        setPets(pets);
      });
  }, []);

  useEffect(() => {
    db.collection("users")
      .get()
      .then(snapshot => {
        let users: any[] = [];
        snapshot.docs.forEach(doc => {
          users.push(doc.data());
        });

        setUsers(users);
      });
  }, []);

  useEffect(() => {
    if (authContext.currentUser && pets) {
      let petsByUser: any[] = [];
      pets.forEach(pet => {
        if (pet.ownerId === authContext.currentUser?.uid) {
          petsByUser.push(pet);
        }
      });
      setPetsByOwner(petsByUser);
    }
  }, [pets, authContext.currentUser]);

  useEffect(() => {
    let bookingsWithPet: any[] = [];
    bookings.forEach(booking => {
      let petName: string = "";
      let ownerName: string = "";
      const petId = booking.petId;
      const ownerId = booking.ownerId;
      const petData = pets.find(pet => pet.id === petId);
      const ownerData = users.find(user => user.id === ownerId);
      if (petData && ownerData) {
        petName = petData.name;
        ownerName = ownerData.firstName + " " + ownerData.lastName;
      }
      bookingsWithPet.push({ ...booking, petName, ownerName });
    });
    console.log(bookingsWithPet);
    setBookingsWithPet(bookingsWithPet);
  }, [pets, bookings, users]);

  useEffect(() => {
    if (bookingsWithPet && authContext.currentUser) {
      let bookingsByOwner: any[] = [];
      bookingsWithPet.forEach(booking => {
        if (booking.ownerId === authContext.currentUser?.uid) {
          bookingsByOwner.push(booking);
        }
      });
      console.log(bookingsByOwner);
      setBookingsByPetOwner(bookingsByOwner);
    }
  }, [bookingsWithPet, authContext.currentUser]);

  useEffect(() => {
    db.collection("settings").onSnapshot(snapshot => {
      let settings;
      snapshot.forEach(doc => {
        settings = doc.data();
      });
      console.log(settings);
      setSettings(settings);
    });
  }, []);

  useEffect(() => {
    if (settings && watchPeriod) {
      console.log(settings);
      const arrivalDate = watchPeriod[0]._d;
      const departureDate = watchPeriod[1]._d;
      const diffMilliseconds = departureDate.getTime() - arrivalDate.getTime();
      const diffDays = diffMilliseconds / (1000 * 3600 * 24);
      const diffDaysInt = parseInt(diffDays.toString().split(".")[0]);
      const fee = parseInt(settings.feeEUR);
      const totalFee = diffDaysInt * fee;
      setTotalFee(totalFee);
    }
  }, [watchPeriod, settings]);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const submitForm = (data: any) => {
    const bookingId = uuidv4();
    let userId = "";
    if (authContext.userRole === "client" && authContext.currentUser) {
      userId = authContext.currentUser.uid;
    } else {
      const pet = pets.find(pet => pet.id === data.pet);
      const petOwnerId = pet.ownerId;
      userId = petOwnerId;
    }
    db.collection("bookings")
      .doc(bookingId)
      .set({
        id: bookingId,
        petId: data.pet,
        ownerId: userId,
        arrival: data.period[0]._d,
        departure: data.period[1]._d,
        notes: data.notes,
        totalFee: totalFee,
        status: "Booked"
      })
      .then(() => {
        alert("Booking successfully created.");
      });
    reset();
    setTotalFee(0);
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
    if (searchParameter === "pet") {
      const bookingsByPet = bookingsWithPet.filter(
        booking => booking.petName === value
      );
      setBookingsWithPet(bookingsByPet);
    } else if (searchParameter === "arrival") {
      const bookingsByArrivalDate = bookingsWithPet.filter(booking => {
        const arrivalDate: Date = booking.arrival.toDate();
        const day = arrivalDate.getDate();
        const month = arrivalDate.getMonth();
        const year = arrivalDate.getFullYear();
        const arrivalDateString = `${month}/${day}/${year}`;
        if (arrivalDateString === value) return true;
        else return false;
      });
      setBookingsWithPet(bookingsByArrivalDate);
    } else if (searchParameter === "departure") {
      const bookingsByDepartureDate = bookingsWithPet.filter(booking => {
        const departureDate: Date = booking.departure.toDate();
        const day = departureDate.getDate();
        const month = departureDate.getMonth();
        const year = departureDate.getFullYear();
        const departureDateString = `${month}/${day}/${year}`;
        if (departureDateString === value) return true;
        else return false;
      });
      setBookingsWithPet(bookingsByDepartureDate);
    } else if (searchParameter === "status") {
      const bookingsByStatus = bookingsWithPet.filter(
        booking => booking.status === value
      );
      setBookingsWithPet(bookingsByStatus);
    } else if (searchParameter === "owner") {
      const bookingsByOwner = bookingsWithPet.filter(
        booking => booking.ownerName === value
      );
      setBookingsWithPet(bookingsByOwner);
    }
  };

  const refreshTableData = () => {
    let bookings: any[] = [];
    db.collection("bookings")
      .get()
      .then(data => {
        data.forEach(doc => {
          bookings.push(doc.data());
        });
        console.log(bookings);
        setBookings(bookings);
      });
  };

  const isPeriodValid = (value: any) => {
    const start: Date = value[0]._d;
    start.setHours(0, 0, 0, 0);
    const end: Date = value[1]._d;
    end.setHours(0, 0, 0, 0);
    const capacity = settings.capacity;
    let countActiveBookings = 0;

    //filter bookings that are Booked or In progress
    const bookingsBookedInProgress = bookings.filter(
      booking => booking.status === "Booked" || booking.status === "In progress"
    );

    //find bookings that intersect
    bookingsBookedInProgress.forEach(booking => {
      const arrival: Date = booking.arrival.toDate();
      arrival.setHours(0, 0, 0, 0);
      const departure: Date = booking.departure.toDate();
      departure.setHours(0, 0, 0, 0);
      if (start < departure && end > arrival) {
        console.log("Booking intersect");
        countActiveBookings = countActiveBookings + 1;
      }
    });

    return countActiveBookings < capacity;
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
      <h1>Bookings</h1>
      <Button
        onClick={handleClick}
        type={"primary"}
        style={{ marginBottom: "10px" }}
      >
        Add booking
      </Button>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
          <span style={{ marginRight: 10 }}>Search users by:</span>
          <Select
            defaultValue="pet"
            style={{ width: 120 }}
            onChange={value => {
              setSerachParameter(value);
            }}
          >
            <Option value="pet">Pet</Option>
            {(authContext.userRole === "manager" ||
              authContext.userRole === "employee") && (
              <Option value="owner">Owner</Option>
            )}
            <Option value="arrival">Arrival</Option>
            <Option value="departure">Departure</Option>
            <Option value="status">Status</Option>
          </Select>
        </div>
        <Search placeholder="Search..." onSearch={handleSearch} enterButton />
      </div>
      {(authContext.userRole === "manager" ||
        authContext.userRole === "employee") && (
        <Table
          dataSource={bookingsWithPet}
          pagination={{ pageSize: 5, defaultCurrent: 1 }}
        >
          <Table.Column
            title={<Button onClick={refreshTableData}>Refresh</Button>}
            width={2}
          />
          <Table.Column
            title="Pet"
            render={booking => {
              return <span>{booking.petName}</span>;
            }}
          />
          <Table.Column
            title="Owner"
            render={booking => {
              return <span>{booking.ownerName}</span>;
            }}
          />
          <Table.Column
            title="Arrival"
            render={booking => {
              if (booking.arrival) {
                const arrivalDate: Date = booking.arrival.toDate();
                const day = arrivalDate.getDate();
                const month = arrivalDate.getMonth() + 1;
                const year = arrivalDate.getFullYear();
                return (
                  <span>
                    {month}/{day}/{year}
                  </span>
                );
              } else return null;
            }}
          />
          <Table.Column
            title="Departure"
            render={booking => {
              if (booking.departure) {
                const departureDate: Date = booking.departure.toDate();
                const day = departureDate.getDate();
                const month = departureDate.getMonth() + 1;
                const year = departureDate.getFullYear();
                return (
                  <span>
                    {month}/{day}/{year}
                  </span>
                );
              } else return null;
            }}
          />
          <Table.Column
            title="Status"
            render={booking => <span>{booking.status}</span>}
          />
          <Table.Column
            title="Total fee"
            render={booking => <span>{booking.totalFee}€</span>}
          />
          <Table.Column
            title="Action"
            render={booking => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <NavLink to={`editBooking/${booking.id}`}>Edit</NavLink>
                {authContext.userRole === "manager" && (
                  <div
                    onClick={() => {
                      db.collection("bookings").doc(booking.id).delete();
                    }}
                    style={{ color: "#14a79d", marginLeft: "10px" }}
                  >
                    Delete
                  </div>
                )}
              </div>
            )}
          />
        </Table>
      )}
      {authContext.userRole === "client" && (
        <Table
          dataSource={bookingsByPetOwner}
          pagination={{ pageSize: 5, defaultCurrent: 1 }}
        >
          <Table.Column
            title={<Button onClick={refreshTableData}>Refresh</Button>}
            width={2}
          />
          <Table.Column
            title="Pet"
            render={booking => {
              return <span>{booking.petName}</span>;
            }}
          />
          <Table.Column
            title="Arrival"
            render={booking => {
              if (booking.arrival) {
                const arrivalDate: Date = booking.arrival.toDate();
                const day = arrivalDate.getDate();
                const month = arrivalDate.getMonth() + 1;
                const year = arrivalDate.getFullYear();
                return (
                  <span>
                    {month}/{day}/{year}
                  </span>
                );
              } else return null;
            }}
          />
          <Table.Column
            title="Departure"
            render={booking => {
              if (booking.departure) {
                const departureDate: Date = booking.departure.toDate();
                const day = departureDate.getDate();
                const month = departureDate.getMonth() + 1;
                const year = departureDate.getFullYear();
                return (
                  <span>
                    {month}/{day}/{year}
                  </span>
                );
              } else return null;
            }}
          />
          <Table.Column
            title="Status"
            render={booking => <span>{booking.status}</span>}
          />
          <Table.Column
            title="Total fee"
            render={booking => <span>{booking.totalFee}€</span>}
          />
        </Table>
      )}
      <Modal
        title={"Add new booking"}
        visible={isModalVisible}
        footer={null}
        closable={false}
      >
        <Form onFinish={handleSubmit(submitForm)} {...layout}>
          <Form.Item label="Pet">
            <Controller
              control={control}
              name={"pet"}
              render={({ field }) => (
                <Select
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                >
                  {(authContext.userRole === "manager" ||
                    authContext.userRole === "employee") &&
                    pets.map(pet => {
                      return (
                        <Option value={pet.id} key={pet.id}>
                          {pet.name}
                        </Option>
                      );
                    })}
                  {authContext.userRole === "client" &&
                    petsByOwner.map(pet => {
                      return (
                        <Option value={pet.id} key={pet.id}>
                          {pet.name}
                        </Option>
                      );
                    })}
                </Select>
              )}
            />
          </Form.Item>
          <Form.Item label="Period">
            <Controller
              control={control}
              name={"period"}
              rules={{ validate: isPeriodValid }}
              render={({ field }) => (
                <RangePicker
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                />
              )}
            />
            {errors.period?.type === "validate" && (
              <span style={{ color: "red", display: "block" }}>
                At this time the hotel is full, please choose another date.
              </span>
            )}
          </Form.Item>
          <Form.Item label="Notes">
            <Controller
              control={control}
              name={"notes"}
              render={({ field }) => (
                <TextArea
                  rows={4}
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                />
              )}
            />
          </Form.Item>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {totalFee ? (
              <span>Total fee: {totalFee}€</span>
            ) : (
              <span>Total fee: 0€</span>
            )}
            <div style={{ marginTop: "10px" }}>
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
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Bookings;

import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "./Auth";
import { db } from "../firebase";
import { Table } from "antd";
import { NavLink } from "react-router-dom";

const Home = () => {
  const authContext = useContext(AuthContext);
  const [petsByUser, setPetsByUser] = useState<any[]>([]);
  const [allPets, setAllPets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsByUser, setBookingsByUser] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookingsWithPet, setBookingsWithPet] = useState<any[]>([]);

  useEffect(() => {
    db.collection("pets").onSnapshot(snapshot => {
      let pets: any[] = [];
      snapshot.forEach(doc => {
        pets.push(doc.data());
      });
      setAllPets(pets);
    });
  }, []);

  useEffect(() => {
    db.collection("bookings").onSnapshot(snapshot => {
      let bookings: any[] = [];
      snapshot.forEach(doc => {
        bookings.push(doc.data());
      });
      setBookings(bookings);
    });
  }, []);

  useEffect(() => {
    db.collection("users").onSnapshot(snapshot => {
      let users: any[] = [];
      snapshot.docs.forEach(doc => {
        users.push(doc.data());
      });

      setUsers(users);
    });
  }, []);

  useEffect(() => {
    if (allPets && authContext) {
      let petsByOwner: any[] = [];
      db.collection("pets")
        .where("ownerId", "==", authContext.currentUser?.uid)
        .get()
        .then(data => {
          data.docs.forEach(doc => {
            petsByOwner.push(doc.data());
          });
          setPetsByUser(petsByOwner);
        });
    }
  }, [allPets, authContext]);

  useEffect(() => {
    if (bookings && authContext) {
      let bookingsByOwner: any[] = [];
      bookingsWithPet.forEach(booking => {
        if (booking.ownerId === authContext.currentUser?.uid) {
          bookingsByOwner.push(booking);
        }
      });
      setBookingsByUser(bookingsByOwner);
    }
  }, [bookingsWithPet, authContext]);

  useEffect(() => {
    let bookingsWithPet: any[] = [];
    bookings.forEach(booking => {
      let petName: string = "";
      let ownerName: string = "";
      const petId = booking.petId;
      const ownerId = booking.ownerId;
      const petData = allPets.find(pet => pet.id === petId);
      const ownerData = users.find(user => user.id === ownerId);
      if (petData && ownerData) {
        petName = petData.name;
        ownerName = ownerData.firstName + " " + ownerData.lastName;
      }
      bookingsWithPet.push({ ...booking, petName, ownerName });
    });
    console.log(bookingsWithPet);
    setBookingsWithPet(bookingsWithPet);
  }, [allPets, bookings, users]);

  if (authContext.userRole) {
    return (
      <div>
        {authContext.userRole === "client" && (
          <div style={{ marginLeft: "20px", marginRight: "20px" }}>
            <h1>Pets</h1>
            <Table
              dataSource={petsByUser}
              pagination={{ pageSize: 5, defaultCurrent: 1 }}
            >
              <Table.Column
                title={"Name"}
                render={pet => <span>{pet.name}</span>}
              />
              <Table.Column
                title="Type"
                render={pet => <span>{pet.type}</span>}
              />
              <Table.Column
                title="Breed"
                render={pet => <span>{pet.breed}</span>}
              />
              <Table.Column
                title="Size"
                render={pet => <span>{pet.size}</span>}
              />
            </Table>

            <h1>Bookings</h1>
            <Table
              dataSource={bookingsByUser}
              pagination={{ pageSize: 5, defaultCurrent: 1 }}
            >
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
          </div>
        )}
        {users.length > 0 &&
          (authContext.userRole === "manager" ||
            authContext.userRole === "employee") && (
            <div style={{ marginLeft: "20px", marginRight: "20px" }}>
              <h1>Users</h1>
              <Table
                dataSource={users}
                pagination={{ pageSize: 5, defaultCurrent: 1 }}
              >
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
                <Table.Column
                  title="Role"
                  render={user => <span>{user.role}</span>}
                />
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
                                  console.log("user can be deleted");
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

              <h1>Pets</h1>
              <Table
                dataSource={allPets}
                pagination={{ pageSize: 5, defaultCurrent: 1 }}
              >
                <Table.Column
                  title={"Name"}
                  render={pet => <span>{pet.name}</span>}
                />
                <Table.Column
                  title="Type"
                  render={pet => <span>{pet.type}</span>}
                />
                <Table.Column
                  title="Breed"
                  render={pet => <span>{pet.breed}</span>}
                />
                <Table.Column
                  title="Size"
                  render={pet => <span>{pet.size}</span>}
                />
                <Table.Column
                  title="Owner"
                  render={pet => {
                    console.log(users);
                    const petOwner = users.find(
                      user => user.id === pet.ownerId
                    );
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
                          console.log(pet.id);
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

              <h1>Bookings</h1>
              <Table
                dataSource={bookingsWithPet}
                pagination={{ pageSize: 5, defaultCurrent: 1 }}
              >
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
            </div>
          )}
      </div>
    );
  } else return <></>;
};

export default Home;

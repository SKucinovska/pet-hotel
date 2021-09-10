import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import { Form, DatePicker, Button, Input, Select } from "antd";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const EditBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>();
  const [ownerName, setOwnerName] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>();
  const [totalFee, setTotalFee] = useState<number>();
  const [inputHaveChanged, setInputHaveChanged] = useState<boolean>(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm();
  const watchPeriod = watch("period");
  const watchNotes = watch("notes");
  const watchStatus = watch("status");

  useEffect(() => {
    db.collection("bookings")
      .doc(bookingId)
      .get()
      .then(doc => {
        setBooking(doc.data());
      });
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      console.log(booking);
      const ownerId = booking.ownerId;
      const petId = booking.petId;
      db.collection("users")
        .doc(ownerId)
        .get()
        .then(doc => {
          const docData = doc.data();
          if (docData) setOwnerName(`${docData.firstName} ${docData.lastName}`);
        });
      db.collection("pets")
        .doc(petId)
        .get()
        .then(doc => {
          const docData = doc.data();
          if (docData) setPetName(`${docData.name}`);
        });
    }
  }, [booking]);

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
    db.collection("settings").onSnapshot(snapshot => {
      let settings;
      snapshot.forEach(doc => {
        settings = doc.data();
      });
      console.log(settings);
      setSettings(settings);
    });
  }, []);

  const submitForm = (data: any) => {
    let start: Date = booking.arrival.toDate();
    start.setHours(0, 0, 0, 0);
    let end: Date = booking.departure.toDate();
    end.setHours(0, 0, 0, 0);

    let newDateArrival: Date = data.period[0]._d;
    newDateArrival.setHours(0, 0, 0, 0);
    let newDateDeparture: Date = data.period[1]._d;
    newDateDeparture.setHours(0, 0, 0, 0);

    if (bookingId) {
      if (
        booking.status !== data.status ||
        booking.notes !== data.notes ||
        start.getTime() !== newDateArrival.getTime() ||
        end.getTime() !== newDateDeparture.getTime()
      ) {
        db.collection("bookings")
          .doc(bookingId)
          .update({
            arrival: data.period[0]._d,
            departure: data.period[1]._d,
            status: data.status,
            notes: data.notes,
            totalFee
          })
          .then(() => {
            alert(
              "The booking successfully updated. The page will reload to see changes."
            );
            window.location.reload();
          });
      }
    }
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
      booking =>
        (booking.status === "Booked" || booking.status === "In progress") &&
        booking.id !== bookingId
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

  const getPeriodFromBooking = () => {
    const startDate: Date = booking.arrival.toDate();
    const endDate: Date = booking.departure.toDate();
    return [
      moment(
        `${startDate.getFullYear()}-${
          startDate.getMonth() + 1
        }-${startDate.getDate()}`
      ),
      moment(
        `${endDate.getFullYear()}-${
          endDate.getMonth() + 1
        }-${endDate.getDate()}`
      )
    ];
  };

  useEffect(() => {
    if (booking && watchPeriod && watchNotes && watchStatus) {
      const start: Date = watchPeriod[0]._d;
      const end: Date = watchPeriod[1]._d;
      const bookingArrival: Date = booking.arrival.toDate();
      const bookingDeparture: Date = booking.departure.toDate();
      if (
        watchNotes !== booking.notes ||
        watchStatus !== booking.status ||
        start.getTime() !== bookingArrival.getTime() ||
        end.getTime() !== bookingDeparture.getTime()
      ) {
        setInputHaveChanged(true);
      } else {
        setInputHaveChanged(false);
      }
    }
  }, [watchPeriod, watchNotes, watchStatus, booking]);

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
      <h1>Edit Booking</h1>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {ownerName && (
          <span style={{ marginBottom: "24px" }}>Owner: {ownerName}</span>
        )}
        {petName && (
          <span style={{ marginBottom: "24px" }}>Pet: {petName}</span>
        )}
      </div>
      {booking && (
        <Form onFinish={handleSubmit(submitForm)}>
          <Form.Item label="Period">
            <Controller
              control={control}
              name={"period"}
              rules={{ validate: isPeriodValid }}
              defaultValue={getPeriodFromBooking}
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
              defaultValue={booking.notes}
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
          <Form.Item label="Status" name="status">
            <Controller
              control={control}
              name={"status"}
              defaultValue={booking.status}
              render={({ field }) => (
                <Select
                  onChange={e => {
                    field.onChange(e);
                  }}
                  value={field.value}
                >
                  <Option value={"Booked"} key={"booked"}>
                    Booked
                  </Option>
                  <Option value={"In progress"} key={"inProgress"}>
                    In Progress
                  </Option>
                  <Option value={"Cancelled"} key={"cancelled"}>
                    Cancelled
                  </Option>
                  <Option value={"Completed"} key={"completed"}>
                    Completed
                  </Option>
                </Select>
              )}
            />
          </Form.Item>
          {totalFee ? (
            <span style={{ display: "block", marginBottom: "24px" }}>
              Total fee: {totalFee}€
            </span>
          ) : (
            <span style={{ display: "block", marginBottom: "24px" }}>
              Total fee: 0€
            </span>
          )}
          {inputHaveChanged === true && (
            <Button htmlType={"submit"} type={"primary"} disabled={false}>
              Edit Booking
            </Button>
          )}
          {inputHaveChanged === false && (
            <Button htmlType={"submit"} type={"primary"} disabled={true}>
              Edit Booking
            </Button>
          )}
        </Form>
      )}
    </div>
  );
};

export default EditBooking;

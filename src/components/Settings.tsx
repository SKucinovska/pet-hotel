import React, { useEffect, useState } from "react";
import { Input, Form, Button } from "antd";
import { useForm, Controller } from "react-hook-form";
import { db } from "../firebase";

const Settings = () => {
  const { control, watch, handleSubmit } = useForm();
  const watchFee = watch("fee");
  const watchCapacity = watch("capacity");
  const [settings, setSettings] = useState<any>();
  const [inputHaveChanged, setInputHaveChanged] = useState<boolean>(false);

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
    console.log(settings);
    if (settings && watchFee && watchCapacity) {
      if (watchFee !== settings.feeEUR || watchCapacity !== settings.capacity) {
        console.log("fee or capacity changed");
        setInputHaveChanged(true);
      } else {
        setInputHaveChanged(false);
      }
    }
  }, [watchFee, watchCapacity, settings]);

  const submitForm = (values: any) => {
    console.log(values);
    db.collection("settings")
      .doc("3WqeMja2MM9OpGGPtpee")
      .update({
        feeEUR: values.fee,
        capacity: values.capacity
      })
      .then(() => {
        alert("Settings successfully added.");
      });
  };

  const layout = {
    labelCol: {
      span: 3
    },
    wrapperCol: {
      span: 10
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
      <Form onFinish={handleSubmit(submitForm)} {...layout}>
        <Form.Item label={"Fee in EUR"} labelAlign="left">
          {settings ? (
            <Controller
              control={control}
              name={"fee"}
              defaultValue={settings.feeEUR}
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
          ) : null}
        </Form.Item>
        <Form.Item label={"Capacity"} labelAlign="left">
          {settings ? (
            <Controller
              control={control}
              name={"capacity"}
              defaultValue={settings ? settings.capacity : ""}
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
          ) : null}
        </Form.Item>
        {inputHaveChanged === true && (
          <Button htmlType={"submit"} type={"primary"} disabled={false}>
            Save changes
          </Button>
        )}
        {inputHaveChanged === false && (
          <Button htmlType={"submit"} type={"primary"} disabled={true}>
            Save changes
          </Button>
        )}
      </Form>
    </div>
  );
};

export default Settings;

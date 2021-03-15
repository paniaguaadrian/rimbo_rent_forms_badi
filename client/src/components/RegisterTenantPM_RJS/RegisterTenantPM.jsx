// React Components
import React, { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TenantReducer, DefaultTenant } from "./tenant-reducer";

// Styles
import styles from "../RegisterTenancy/register-user.module.scss";

// Constants
import { UPDATE_NEWTENANT_INFO } from "./tenant-constants";

// Custom Components
import Input from "../Input";
import InputFile from "../InputFile";
import Button from "../Button";
import Loader from "react-loader-spinner";

const RegisterTenantPM = () => {
  const { tenancyID } = useParams();

  const [tenant, setTenant] = useReducer(TenantReducer, DefaultTenant);
  const [isProcessing, setProcessingTo] = useState(false);
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false); //eslint-disable-line
  const [err, setErr] = useState(null); //eslint-disable-line

  const [date, setDate] = useState("");
  // const [landlordName, setLandlordName] = useState("");
  // const [landlordEmail, setLandlordEmail] = useState("");
  // const [landlordPhone, setLandlordPhone] = useState("");

  const [files, setFiles] = useState({
    pmAnex: null,
  });
  const [sent, isSent] = useState(false);
  const [responseDataAfter, setResponseDataAfter] = useState([]);

  useEffect(() => {
    const getData = () => {
      fetch(`http://localhost:8081/api/tenancies/tenancy/${tenancyID}`)
        .then((res) => {
          if (res.status >= 400) {
            throw new Error("Server responds with error!" + res.status);
          }
          return res.json();
        })
        .then(
          (responseData) => {
            setResponseData(responseData);
            setLoading(true);
          },
          (err) => {
            setErr(err);
            setLoading(true);
          }
        );
    };
    getData();
  }, [tenancyID]);

  const changeFilesHandler = (event) => {
    const name = event.target.name;
    setFiles((files) => {
      const newFiles = { ...files };
      newFiles[name] = event.target.files[0];
      return newFiles;
    });
  };

  const handleNewTenant = ({ target }) => {
    setTenant({
      type: UPDATE_NEWTENANT_INFO,
      payload: { [target.name]: target.value },
    });
  };

  // const changeTextHandler = (event) => {
  //   setLandlordName(event.target.value);
  //   setLandlordEmail(event.target.value);
  //   setLandlordPhone(event.target.value);
  //   setDate(event.target.value);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    isSent(false);
    // const api_rimbo_tenants = process.env.REACT_APP_API_RIMBO_TENANTS;
    // ! POST to RIMBO_API => DB
    // Production axios: `${api_rimbo_tenants}`;
    // Development axios : "http://localhost:8081/api/tenants/tenant/:randomID"
    // ! POST to email service
    // Production axios: `${XXXXXXXXXXXXX}`;
    // Development axios : "http://localhost:8080/submit-email/rj2"
    setProcessingTo(true);

    const formData = new FormData();
    for (const key in files) {
      formData.append(key, files[key]);
    }
    formData.append("date", date);
    formData.append("tenancyID", tenancyID);

    // const formDataB = new FormData();
    // formDataB.append("landlordName", landlordName);
    // formDataB.append("landlordEmail", landlordEmail);
    // formDataB.append("landlordPhone", landlordPhone);
    // formDataB.append("tenancyID", tenancyID);

    // console.log(landlordName);

    // ! POST to RIMBO_API => DB
    await axios.post(
      `http://localhost:8081/api/tenancies/tenancy/${tenancyID}`,
      formData
    );

    await axios.post(
      `http://localhost:8081/api/tenancies/tenancy/badi/${tenancyID}`,
      {
        landlordName: tenant.landlordName,
        landlordEmail: tenant.landlordEmail,
        landlordPhone: tenant.landlordPhone,
        tenancyID,
      }
    );

    isSent(true);
    setIsSuccessfullySubmitted(true);
  };

  useEffect(() => {
    const getData = () => {
      fetch(`http://localhost:8081/api/tenancies/tenancy/${tenancyID}`)
        .then((res) => {
          if (res.status >= 400) {
            throw new Error("Server responds with error!" + res.status);
          }
          return res.json();
        })
        .then(
          (responseDataAfter) => {
            setResponseDataAfter(responseDataAfter);
            setLoading(true);
          },
          (err) => {
            setErr(err);
            setLoading(true);
          }
        );
    };
    getData();
  }, [sent, tenancyID]);

  useEffect(() => {
    const sendAttachments = async () => {
      if (sent) {
        await axios.post("http://localhost:8080/submit-email/rjs", {
          agencyName: responseDataAfter.agent.agencyName,
          rentalAddress: responseDataAfter.property.rentalAddress,
          tenantsName: responseDataAfter.tenant.tenantsName,
          pmAnex: responseDataAfter.pmAnex,
          tenancyID: tenancyID,
        });
      }
    };
    sendAttachments();
  }, [responseDataAfter]); //eslint-disable-line

  return (
    <>
      {!isSuccessfullySubmitted ? (
        <div className={styles.RegisterContainer}>
          <div className={styles.Register}>
            <h1>
              Horray! The rental is now covered by Rimbo! Your tenants can move
              in now!
            </h1>
            <div className={styles.ExtraInfoContainer}>
              {/* <h2>
                All we need from you is the following information. Quick and
                easy!
              </h2> */}
              <p>Confirm the rental start date and upload the Rimbo Annex.</p>
            </div>
          </div>
          <div className={styles.FormContent}>
            <form
              onSubmit={handleSubmit}
              className="styles.RegisterForm"
              encType="multipart/form-data"
            >
              <Input
                type="text"
                name="landlordName"
                value={tenant.landlordName}
                label="Landlord full name"
                placeholder="Enter name and surname"
                onChange={(e) => handleNewTenant(e)}
                required
                // error={errors.landlordName}
              />
              <Input
                type="email"
                name="landlordEmail"
                value={tenant.landlordEmail}
                label="Landlord email"
                placeholder="Enter a valid email address"
                onChange={(e) => handleNewTenant(e)}
                required
                // error={errors.landlordEmail}
              />
              <Input
                type="tel"
                name="landlordPhone"
                value={tenant.landlordPhone}
                label="Landlord phone number"
                placeholder="Enter phone number"
                onChange={(e) => handleNewTenant(e)}
                required
                // error={errors.landlordPhone}
              />
              <Input
                type="date"
                name="date"
                value={date}
                label="Rental start date"
                placeholder="Write your income"
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <InputFile
                type="file"
                name="File"
                label="Rental Agreement - Rimbo Annex"
                onChange={changeFilesHandler}
                required
              />

              <div className={styles.ButtonContainer}>
                {isProcessing ? (
                  <Loader
                    type="Puff"
                    color="#01d2cc"
                    height={50}
                    width={50}
                    timeout={3000} //3 secs
                  />
                ) : (
                  <Button disabled={isProcessing} type="submit">
                    Send
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.SuccessPageContainer}>
          <div className={styles.SuccessPageText}>
            <h1>The form has been completed successfully</h1>
            <h2>All data has been successfully completed</h2>
            <p>
              Thanks for your time <b>{responseData.tenant.tenantsName}</b>, We
              will contact you shortly to give you more details of the process.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterTenantPM;

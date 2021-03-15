// React Components
import React, { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TenantReducer, DefaultTenant } from "./tenant-reducer";

// Styles
import styles from "../RegisterTenancy/register-user.module.scss";

// Validation
import { newTenant } from "./tenant_validation";

// Constants
import { UPDATE_NEWTENANT_INFO } from "./tenant-constants";

// Custom Components
import Input from "../Input";
import InputCheck from "../InputCheck";
import InputFile from "../InputFile";
import Button from "../Button";
import Loader from "react-loader-spinner";

const RegisterTenant = () => {
  let { tenancyID } = useParams();
  const randomID = tenancyID;

  const [tenant, setTenant] = useReducer(TenantReducer, DefaultTenant);
  const [errors, setErrors] = useState({});
  const [isProcessing, setProcessingTo] = useState(false);
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [files, setFiles] = useState({
    DF: null,
    DB: null,
    DCA: null,
  });
  const [sent, isSent] = useState(false);
  const [responseDataAfter, setResponseDataAfter] = useState([]);

  useEffect(
    () => {
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
    },
    [tenancyID],
    [responseData, loading, err]
  );

  const handleNewTenant = ({ target }) => {
    setTenant({
      type: UPDATE_NEWTENANT_INFO,
      payload: { [target.name]: target.value },
    });
  };

  const changeHandler = (event) => {
    const name = event.target.name;
    setFiles((files) => {
      const newFiles = { ...files };
      newFiles[name] = event.target.files[0];
      return newFiles;
    });
  };

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

    const formData = new FormData();
    for (const key in files) {
      formData.append(key, files[key]);
    }
    formData.append("randomID", randomID);

    const errors = newTenant(tenant);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setProcessingTo(true);
    // setIsSuccessfullySubmitted(true);

    // ! Post to Rimbo API (files/images)
    await axios.post(
      `http://localhost:8081/api/tenants/tenant/${randomID}/upload`,
      formData,
      { randomID }
    );

    // ! Post to Rimbo API Data
    await axios.post(`http://localhost:8081/api/tenants/tenant/${randomID}`, {
      // tenant
      monthlyNetIncome: tenant.monthlyNetIncome,
      jobType: tenant.jobType,
      documentType: tenant.documentType,
      documentNumber: tenant.documentNumber,
      tenantsAddress: tenant.tenantsAddress,
      tenantsZipCode: tenant.tenantsZipCode,
      isAcceptedPrivacy: tenant.isAcceptedPrivacy,
      randomID: tenancyID,
    });

    // ! POST to email service
    await axios.post("http://localhost:8080/submit-email/rj2/tt", {
      // Agent/Agency
      agencyName: responseData.agent.agencyName,
      agencyContactPerson: responseData.agent.agencyContactPerson,
      agencyPhonePerson: responseData.agent.agencyPhonePerson,
      agencyEmailPerson: responseData.agent.agencyEmailPerson,
      tenancyID,
      // Tenant
      tenantsName: responseData.tenant.tenantsName,
      tenantsPhone: responseData.tenant.tenantsPhone,
      tenantsEmail: responseData.tenant.tenantsEmail,
      monthlyNetIncome: tenant.monthlyNetIncome,
      jobType: tenant.jobType,
      documentNumber: tenant.documentNumber,
      // ! Falta documento de DNI
      tenantsAddress: tenant.tenantsAddress,
      tenantsZipCode: tenant.tenantsZipCode,
      // Proprety
      rentAmount: responseData.rentAmount,
      product: responseData.product,
      rentDuration: responseData.rentDuration,
      rentalAddress: responseData.property.rentalAddress,
      rentalCity: responseData.property.rentalCity,
      rentalPostalCode: responseData.property.rentalPostalCode,
      // Landlord
      landlordName: responseData.landlord.landlordName,
      landlordPhone: responseData.landlord.landlordPhone,
      landlordEmail: responseData.landlord.landlordEmail,
    });
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
        await axios.post("http://localhost:8080/submit-email/rj2/rimbo", {
          tenancyID,
          tenantsName: responseDataAfter.tenant.tenantsName,
          tenantsPhone: responseDataAfter.tenant.tenantsPhone,
          tenantsEmail: responseDataAfter.tenant.tenantsEmail,
          agencyName: responseDataAfter.agent.agencyName,
          agencyContactPerson: responseDataAfter.agent.agencyContactPerson,
          agencyPhonePerson: responseDataAfter.agent.agencyPhonePerson,
          agencyEmailPerson: responseDataAfter.agent.agencyEmailPerson,
          documentImageFront: responseDataAfter.tenant.documentImageFront,
          documentImageBack: responseDataAfter.tenant.documentImageBack,
          documentConfirmAddress:
            responseDataAfter.tenant.documentConfirmAddress,
          // Agent/Agency
          monthlyNetIncome: tenant.monthlyNetIncome,
          jobType: tenant.jobType,
          documentNumber: tenant.documentNumber,
          tenantsAddress: tenant.tenantsAddress,
          tenantsZipCode: tenant.tenantsZipCode,
          // Proprety
          rentAmount: responseDataAfter.rentAmount,
          product: responseDataAfter.product,
          rentDuration: responseDataAfter.rentDuration,
          rentalAddress: responseDataAfter.property.rentalAddress,
          rentalCity: responseDataAfter.property.rentalCity,
          rentalPostalCode: responseDataAfter.property.rentalPostalCode,
          // Landlord
          landlordName: responseDataAfter.landlord.landlordName,
          landlordPhone: responseDataAfter.landlord.landlordPhone,
          landlordEmail: responseDataAfter.landlord.landlordEmail,
        });
      }
    };
    sendAttachments();
  }, [responseDataAfter]); //eslint-disable-line

  const documentType = ["DNI", "NIE", "Passport", "Other"];
  const jobType = [
    "Salaried",
    "Autonomous",
    "Unemployed",
    "We are a company",
    "I'm retired",
    "I am a student",
    "Other",
  ];

  return (
    <>
      {!isSuccessfullySubmitted ? (
        <div className={styles.RegisterContainer}>
          <div className={styles.Register}>
            <h1>
              Tell us a little more about yourself to save
              <br /> the deposit of your next apartment
            </h1>
            <div className={styles.ExtraInfoContainer}>
              <h2>
                All we need from you is the following information. Quick and
                easy!
              </h2>
              <p>
                We will need a scanned copy of your DNI / NIE (front and back)
                or passport and a document that confirms your current address.
                If you are an EU citizen, please provide your NIE number in the
                “Document number” field and send us a scanned copy of the
                identity document of your country of origin.
              </p>
            </div>
          </div>
          <div className={styles.FormContent}>
            <form
              onSubmit={handleSubmit}
              className="styles.RegisterForm"
              encType="multipart/form-data"
            >
              <div className={styles.FormIntern}>
                <div className={styles.FormLeft}>
                  <Input
                    type="number"
                    name="monthlyNetIncome"
                    value={tenant.monthlyNetIncome}
                    label="Monthly net income"
                    placeholder="Write your income"
                    onChange={(e) => handleNewTenant(e)}
                    error={errors.monthlyNetIncome}
                  />

                  <div className={styles.selectContainer}>
                    <label
                      className={styles.selectLabel}
                      htmlFor="documentType"
                    >
                      Document Type
                    </label>
                    <select
                      required
                      name="documentType"
                      className={styles.selectInput}
                      value={tenant.documentType}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.documentType}
                    >
                      <option value="">Select Document Type</option>
                      {documentType.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    type="text"
                    name="tenantsAddress"
                    value={tenant.tenantsAddress}
                    label="Current Address"
                    placeholder="Write the address where you reside"
                    onChange={(e) => handleNewTenant(e)}
                    error={errors.tenantsAddress}
                  />
                </div>

                <div className={styles.FormRight}>
                  <div className={styles.selectContainer}>
                    <label className={styles.selectLabel} htmlFor="jobType">
                      Job Type
                    </label>
                    <select
                      required
                      name="jobType"
                      className={styles.selectInput}
                      value={tenant.jobType}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.jobType}
                    >
                      <option value="">Select your job type</option>
                      {jobType.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    type="text"
                    name="documentNumber"
                    value={tenant.documentNumber}
                    label="Document Number"
                    placeholder="Write the number of your document"
                    onChange={(e) => handleNewTenant(e)}
                    error={errors.documentNumber}
                  />
                  <Input
                    type="number"
                    name="tenantsZipCode"
                    value={tenant.tenantsZipCode}
                    label="Current zip code"
                    placeholder="XXXXX"
                    onChange={(e) => handleNewTenant(e)}
                    error={errors.tenantsZipCode}
                  />
                </div>
              </div>
              <div className={styles.FormIntern}>
                <div className={styles.FormLeft}>
                  <InputFile
                    type="file"
                    name="DF"
                    label="DNI/NIE (Front)"
                    placeholder="XXXXX"
                    onChange={changeHandler}
                    required
                  />
                  <InputFile
                    type="file"
                    name="DB"
                    label="DNI/NIE (Back)"
                    placeholder="XXXXX"
                    onChange={changeHandler}
                    required
                  />
                </div>
                <div className={styles.FormRight}>
                  <InputFile
                    type="file"
                    name="DCA"
                    label="Document confirming your current address (eg receipt of supplies)"
                    onChange={changeHandler}
                    required
                  />
                </div>
              </div>

              <div className={styles.TermsContainer}>
                <InputCheck
                  type="checkbox"
                  required
                  name="isAcceptedPrivacy"
                  id="terms"
                  value={tenant.isAcceptedPrivacy}
                  placeholder="Accept our terms and conditions"
                  onChange={(e) => handleNewTenant(e)}
                  error={errors.isAcceptedPrivacy}
                />
                <p>
                  By submitting this form, you understand and agree that we use
                  your information in accordance with our{" "}
                  <a
                    href="https://rimbo.rent/en/privacy-policy/"
                    target="_blank"
                    rel="noreferrer"
                    className="link-tag"
                  >
                    {" "}
                    privacy policy{" "}
                  </a>{" "}
                  and our{" "}
                  <a
                    href="https://rimbo.rent/en/cookies-policy/"
                    target="_blank"
                    rel="noreferrer"
                    className="link-tag"
                  >
                    {" "}
                    cookies policy{" "}
                  </a>
                  to offer you Rimbo services.
                </p>
              </div>
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
                    Submit
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

export default RegisterTenant;

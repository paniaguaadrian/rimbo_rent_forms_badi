// React Components
import React, { useState, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TenantReducer, DefaultTenant } from "./tenant-reducer";

// Styles
import styles from "../RegisterTenancy/register-user.module.scss";
import style from "./form.module.scss";

// Validation
import { newTenant } from "./tenant_validation";

// Reducer Constants
import { UPDATE_NEWTENANT_INFO } from "./tenant-constants";

// Custom Components
import Input from "../Input";
import InputCheck from "../InputCheck";
import InputFile from "../InputFile";
import Button from "../Button";
import Loader from "react-loader-spinner";
import LocationOnIcon from "@material-ui/icons/LocationOn";

// Multi language
import { withNamespaces } from "react-i18next";
import i18n from "../../i18n";

// ! Google Maps Autocomplete
import PlacesAutocomplete, {
  geocodeByAddress,
} from "react-places-autocomplete";

// End-Points env
const {
  REACT_APP_BASE_URL,
  REACT_APP_API_RIMBO_TENANCY,
  REACT_APP_API_RIMBO_TENANT,
  REACT_APP_BASE_URL_EMAIL,
} = process.env;

const RegisterTenant = ({ t }) => {
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
    LP: null,
    PP: null,
  });
  const [sent, isSent] = useState(false);
  const [responseDataAfter, setResponseDataAfter] = useState([]);

  useEffect(
    () => {
      const getData = () => {
        fetch(
          `${REACT_APP_BASE_URL}${REACT_APP_API_RIMBO_TENANCY}/${tenancyID}`
        )
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

    const formData = new FormData();
    for (const key in files) {
      formData.append(key, files[key]);
    }
    formData.append("randomID", randomID);

    const errors = newTenant(tenant);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setProcessingTo(true);

    // ! Post to Rimbo API (files/images)
    await axios.post(
      `${REACT_APP_BASE_URL}${REACT_APP_API_RIMBO_TENANT}/${randomID}/upload`,
      formData,
      { randomID }
    );

    // ! Post to Rimbo API Data
    await axios.post(
      `${REACT_APP_BASE_URL}${REACT_APP_API_RIMBO_TENANT}/${randomID}`,
      {
        // tenant
        monthlyNetIncome: tenant.monthlyNetIncome,
        jobType: tenant.jobType,
        documentType: tenant.documentType,
        documentNumber: tenant.documentNumber,
        tenantsAddress: tenantsAddress,
        tenantsZipCode: tenantsZipCode,
        isAcceptedGC: tenant.isAcceptedGC,
        randomID: tenancyID,
      }
    );

    // ! POST to email service
    if (i18n.language === "en") {
      await axios.post(`${REACT_APP_BASE_URL_EMAIL}/en/rj2/tt`, {
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
        tenantsAddress: tenantsAddress,
        tenantsZipCode: tenantsZipCode,
        // Proprety
        rentAmount: responseData.rentAmount,
        product: responseData.product,
        rentDuration: responseData.rentDuration,
        rentalAddress: responseData.property.rentalAddress,
        rentalCity: responseData.property.rentalCity,
        rentalPostalCode: responseData.property.rentalPostalCode,
      });
    } else {
      await axios.post(`${REACT_APP_BASE_URL_EMAIL}/rj2/tt`, {
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
        tenantsAddress: tenantsAddress,
        tenantsZipCode: tenantsZipCode,
        // Proprety
        rentAmount: responseData.rentAmount,
        product: responseData.product,
        rentDuration: responseData.rentDuration,
        rentalAddress: responseData.property.rentalAddress,
        rentalCity: responseData.property.rentalCity,
        rentalPostalCode: responseData.property.rentalPostalCode,
      });
    }

    isSent(true);
    setIsSuccessfullySubmitted(true);
  };

  // ! Google Maps Autocomplete
  const [tenantsAddress, setTenantsAddress] = useState("");
  const [tenantsZipCode, setTenantsZipCode] = useState("");

  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);

    const addressComponents = results[0].address_components;

    const route = "route";
    const locality = "locality";
    const streetNumber = "street_number";
    const postalCode = "postal_code";

    if (
      addressComponents[0].types[0] === route &&
      addressComponents[1].types[0] === locality
    ) {
      setTenantsZipCode("");
      setTenantsAddress(results[0].formatted_address);
    } else if (
      addressComponents[0].types[0] === streetNumber && // number
      addressComponents[1].types[0] === route && // Street
      addressComponents[2].types[0] === locality && // Barcelona
      addressComponents[6].types[0] === postalCode
    ) {
      setTenantsZipCode(results[0].address_components[6].long_name);
      setTenantsAddress(results[0].formatted_address);
    }

    setTenantsAddress(results[0].formatted_address);
  };

  useEffect(() => {
    const getData = () => {
      fetch(`${REACT_APP_BASE_URL}${REACT_APP_API_RIMBO_TENANCY}/${tenancyID}`)
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
        if (i18n.language === "en") {
          await axios.post(`${REACT_APP_BASE_URL_EMAIL}/en/rj2/rimbo`, {
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
            lastPayslip: responseDataAfter.tenant.lastPayslip,
            previousPayslip: responseDataAfter.tenant.previousPayslip,
            // Agent/Agency
            monthlyNetIncome: tenant.monthlyNetIncome,
            jobType: tenant.jobType,
            documentNumber: tenant.documentNumber,
            tenantsAddress: tenantsAddress,
            tenantsZipCode: tenantsZipCode,
            // Proprety
            rentAmount: responseDataAfter.rentAmount,
            product: responseDataAfter.product,
            rentDuration: responseDataAfter.rentDuration,
            rentalAddress: responseDataAfter.property.rentalAddress,
            rentalCity: responseDataAfter.property.rentalCity,
            rentalPostalCode: responseDataAfter.property.rentalPostalCode,
          });
        } else {
          await axios.post(`${REACT_APP_BASE_URL_EMAIL}/rj2/rimbo`, {
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
            lastPayslip: responseDataAfter.tenant.lastPayslip,
            previousPayslip: responseDataAfter.tenant.previousPayslip,
            // Agent/Agency
            monthlyNetIncome: tenant.monthlyNetIncome,
            jobType: tenant.jobType,
            documentNumber: tenant.documentNumber,
            tenantsAddress: tenantsAddress,
            tenantsZipCode: tenantsZipCode,
            // Proprety
            rentAmount: responseDataAfter.rentAmount,
            product: responseDataAfter.product,
            rentDuration: responseDataAfter.rentDuration,
            rentalAddress: responseDataAfter.property.rentalAddress,
            rentalCity: responseDataAfter.property.rentalCity,
            rentalPostalCode: responseDataAfter.property.rentalPostalCode,
          });
        }
      }
    };
    sendAttachments();
  }, [responseDataAfter]); //eslint-disable-line

  // const documentType = ["DNI", "NIE", "Passport", "Other"];
  // const jobType = [
  //   "Salaried",
  //   "Autonomous",
  //   "Unemployed",
  //   "We are a company",
  //   "I'm retired",
  //   "I am a student",
  //   "Other",
  // ];

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="La plataforma de alquiler sin depósitos. Descubre una nueva forma de alquilar. Rimbo ahorra al inquilino meses de depósito a la vez que brinda más protección al propietario."
        />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

        <title>{t("RJ2.header")}</title>
      </Helmet>
      {!isSuccessfullySubmitted ? (
        <div className={styles.RegisterContainer}>
          <div className={styles.Register}>
            <h1>
              {t("RJ2.titleOne")}
              <br /> {t("RJ2.titleTwo")}
            </h1>
            <div className={styles.ExtraInfoContainer}>
              <h2>{t("RJ2.subtitle")}</h2>
              <p>{t("RJ2.warning")}</p>
            </div>
          </div>
          <div className={style.FormContent}>
            <form
              onSubmit={handleSubmit}
              className={styles.RegisterForm}
              encType="multipart/form-data"
            >
              <div className={style.FormIntern}>
                <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    <Input
                      type="number"
                      name="monthlyNetIncome"
                      value={tenant.monthlyNetIncome}
                      label={t("RJ2.monthlyNetIncome")}
                      placeholder={t("RJ2.monthlyNetIncomePL")}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.monthlyNetIncome}
                    />
                  </div>
                  <div className={style.FormLeft}>
                    <div className={styles.selectContainer}>
                      <label className={styles.selectLabel} htmlFor="jobType">
                        {t("RJ2.jobType")}
                      </label>
                      <select
                        required
                        name="jobType"
                        className={styles.selectInput}
                        value={tenant.jobType}
                        onChange={(e) => handleNewTenant(e)}
                        error={errors.jobType}
                      >
                        <option value="">{t("RJ2.jobTypePL")}</option>

                        <option name="jobType" value={t("RJ2.jobTypeOne")}>
                          {t("RJ2.jobTypeOne")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeTwo")}>
                          {t("RJ2.jobTypeTwo")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeThree")}>
                          {t("RJ2.jobTypeThree")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeFour")}>
                          {t("RJ2.jobTypeFour")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeFive")}>
                          {t("RJ2.jobTypeFive")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeSix")}>
                          {t("RJ2.jobTypeSix")}
                        </option>

                        <option name="jobType" value={t("RJ2.jobTypeSeven")}>
                          {t("RJ2.jobTypeSeven")}
                        </option>

                        {/* {jobType.map((c) => (
                          <option key={c}>{c}</option>
                        ))} */}
                      </select>
                    </div>
                  </div>
                </div>
                <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    {/* Google maps Autocomplete */}
                    <PlacesAutocomplete
                      value={tenantsAddress}
                      onChange={setTenantsAddress}
                      onSelect={handleSelect}
                    >
                      {({
                        getInputProps,
                        suggestions,
                        getSuggestionItemProps,
                        loading,
                      }) => (
                        <div>
                          <Input
                            id="googleInput"
                            {...getInputProps()}
                            label={t("RJ2.tenantsAddress")}
                            placeholder={t("RJ2.tenantsAddressPL")}
                            required
                          />
                          <div className={styles.GoogleSuggestionContainer}>
                            {/* display sugestions */}
                            {loading ? <div>...loading</div> : null}
                            {suggestions.map((suggestion, place) => {
                              const style = {
                                backgroundColor: suggestion.active
                                  ? "#24c4c48f"
                                  : "#fff",
                                cursor: "pointer",
                              };
                              return (
                                <div
                                  className={styles.GoogleSuggestion}
                                  {...getSuggestionItemProps(suggestion, {
                                    style,
                                  })}
                                  key={place}
                                >
                                  <LocationOnIcon />
                                  <span>{suggestion.description}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </PlacesAutocomplete>

                    {/* <Input
                type="text"
                name="rentalAddress"
                id="rentalAddress"
                value={rentalAddress}
                label={t("RJ1.stepTwo.rentalAddress")}
                placeholder={t("RJ1.stepTwo.rentalAddressPL")}
                onChange={setRentalAddress}
                disabled
              /> */}
                  </div>

                  <div className={style.FormLeft}>
                    <Input
                      type="text"
                      name="rentalPostalCode"
                      id="rentalPostalCode"
                      value={tenantsZipCode}
                      label={t("RJ2.tenantsZipCode")}
                      placeholder={t("RJ2.tenantsZipCodePL")}
                      onChange={setTenantsZipCode}
                      disabled
                    />
                  </div>

                  {/* <Input
                  type="text"
                  name="rentalCity"
                  id="rentalCity"
                  value={rentalCity}
                  label={t("RJ1.stepTwo.rentalCity")}
                  placeholder={t("RJ1.stepTwo.rentalCityPL")}
                  onChange={setRentalCity}
                  disabled
                /> */}
                </div>
                {/* <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    <Input
                      type="text"
                      name="tenantsAddress"
                      value={tenant.tenantsAddress}
                      label={t("RJ2.tenantsAddress")}
                      placeholder={t("RJ2.tenantsAddressPL")}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.tenantsAddress}
                    />
                  </div>

                  <div className={style.FormLeft}>
                    <Input
                      type="number"
                      name="tenantsZipCode"
                      value={tenant.tenantsZipCode}
                      label={t("RJ2.tenantsZipCode")}
                      placeholder={t("RJ2.tenantsZipCodePL")}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.tenantsZipCode}
                    />
                  </div>
                </div> */}
                <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    <div className={styles.selectContainer}>
                      <label
                        className={styles.selectLabel}
                        htmlFor="documentType"
                      >
                        {t("RJ2.documentType")}
                      </label>
                      <select
                        required
                        name="documentType"
                        className={styles.selectInput}
                        value={tenant.documentType}
                        onChange={(e) => handleNewTenant(e)}
                        error={errors.documentType}
                      >
                        <option value="">{t("RJ2.documentTypePL")}</option>

                        <option
                          name="documentType"
                          value={t("RJ2.documentTypeOne")}
                        >
                          {t("RJ2.documentTypeOne")}
                        </option>

                        <option
                          name="documentType"
                          value={t("RJ2.documentTypeTwo")}
                        >
                          {t("RJ2.documentTypeTwo")}
                        </option>

                        <option
                          name="documentType"
                          value={t("RJ2.documentTypeThree")}
                        >
                          {t("RJ2.documentTypeThree")}
                        </option>

                        <option
                          name="documentType"
                          value={t("RJ2.documentTypeFour")}
                        >
                          {t("RJ2.documentTypeFour")}
                        </option>

                        {/* {documentType.map((c) => (
                          <option key={c}>{c}</option>
                        ))} */}
                      </select>
                    </div>
                  </div>
                  <div className={style.FormLeft}>
                    <Input
                      type="text"
                      name="documentNumber"
                      value={tenant.documentNumber}
                      label={t("RJ2.documentNumber")}
                      placeholder={t("RJ2.documentNumberPL")}
                      onChange={(e) => handleNewTenant(e)}
                      error={errors.documentNumber}
                    />
                  </div>
                </div>
                <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    <InputFile
                      type="file"
                      name="DF"
                      label={t("RJ2.DF")}
                      placeholder="XXXXX"
                      onChange={changeHandler}
                      required
                    />
                  </div>
                  <div className={style.FormLeft}>
                    <InputFile
                      type="file"
                      name="DB"
                      label={t("RJ2.DB")}
                      placeholder="XXXXX"
                      onChange={changeHandler}
                      required
                    />
                  </div>
                </div>
                <div className={style.GroupInput}>
                  <div className={style.FormLeft}>
                    <InputFile
                      type="file"
                      name="LP"
                      label={t("RJ2.LP")}
                      onChange={changeHandler}
                      required
                    />
                  </div>
                  <div className={style.FormLeft}>
                    <InputFile
                      type="file"
                      name="PP"
                      label={t("RJ2.PP")}
                      onChange={changeHandler}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.TermsContainer}>
                <InputCheck
                  type="checkbox"
                  required
                  name="isAcceptedGC"
                  id="terms"
                  value={tenant.isAcceptedGC}
                  placeholder="Accept our terms and conditions"
                  onChange={(e) => handleNewTenant(e)}
                  error={errors.isAcceptedGC}
                />
                <p>
                  {t("RJ2.checkboxOne")}{" "}
                  <a
                    href="https://rimbo.rent/en/privacy-policy/"
                    target="_blank"
                    rel="noreferrer"
                    className="link-tag"
                  >
                    {" "}
                    {t("RJ2.checkboxTwo")}{" "}
                  </a>{" "}
                  {t("RJ2.checkboxThree")}{" "}
                  <a
                    href="https://rimbo.rent/en/cookies-policy/"
                    target="_blank"
                    rel="noreferrer"
                    className="link-tag"
                  >
                    {" "}
                    {t("RJ2.checkboxFour")}{" "}
                  </a>
                  {t("RJ2.checkboxFive")}
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
                    {t("submitButton")}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.CompleteContainer}>
          <div className={styles.CompleteText}>
            <h1>{t("RJ2.completedTitle")}</h1>
            <h3>{t("RJ2.completedSubtitle")}</h3>
            <p>
              {t("RJ2.completeSubtextOne")}
              <b>{responseData.tenant.tenantsName}</b>,{" "}
              {t("RJ2.completeSubtextTwo")}
            </p>
            <h3>{t("RJ2.completeRegards")}</h3>
          </div>
        </div>
      )}
    </>
  );
};

export default withNamespaces()(RegisterTenant);

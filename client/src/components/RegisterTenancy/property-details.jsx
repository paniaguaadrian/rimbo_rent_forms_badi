// React Components
import React, { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

// Styles
import styles from "../RegisterTenancy/register-user.module.scss";
import style from "../RegisterTenant_RJ2/form.module.scss";

// Validation
import { isProperty } from "./validation";

// Constants
import { UPDATE_PROPERTY_INFO } from "./constants";

// Custom Components
import Input from "../Input";
import InputCheck from "../InputCheck";
import Button from "../Button";
import Loader from "react-loader-spinner";
import LocationOnIcon from "@material-ui/icons/LocationOn";

// nanoid
import { nanoid } from "nanoid";

// Multi language
import { withNamespaces } from "react-i18next";
import i18n from "../../i18n";

// ! Google maps Autocomplete
import PlacesAutocomplete, {
  geocodeByAddress,
} from "react-places-autocomplete";

// End-Points env
const {
  REACT_APP_BASE_URL,
  REACT_APP_API_RIMBO_TENANCY_BADI,
  REACT_APP_BASE_URL_EMAIL,
} = process.env;

const PropertyDetails = ({ step, setStep, tenancy, setTenancy, t }) => {
  const [errors, setErrors] = useState({});
  const [isProcessing, setProcessingTo] = useState(false);

  // Handle on change
  const handleAgency = ({ target }) => {
    setTenancy({
      type: UPDATE_PROPERTY_INFO,
      payload: { [target.name]: target.value },
    });
  };

  // Hanlde con next / continue
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = isProperty(tenancy.propertyDetails);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setProcessingTo(true);

    const randomID = nanoid();

    // const rentalAddress = document.getElementById("rentalAddress").value;
    // const rentalCity = document.getElementById("rentalCity").value;
    // const rentalPostalCode = document.getElementById("rentalPostalCode").value;

    await axios.post(
      `${REACT_APP_BASE_URL}${REACT_APP_API_RIMBO_TENANCY_BADI}`,
      {
        // tenant
        tenantsName: tenancy.tenantDetails.tenantName,
        tenantsEmail: tenancy.tenantDetails.tenantEmail,
        tenantsPhone: tenancy.tenantDetails.tenantPhone,
        randomID: randomID,
        // agency, agent
        agencyName: tenancy.agencyName,
        agencyEmailPerson: tenancy.agencyEmailPerson,
        agencyContactPerson: tenancy.agencyContactPerson,
        agencyPhonePerson: tenancy.agencyPhonePerson,
        isAgentAccepted: tenancy.propertyDetails.isAgentAccepted,
        // property
        fullRentalAddress: fullRentalAddress,
        rentalAddress: rentalAddress,
        rentalAddressSecond: tenancy.propertyDetails.rentalAddressSecond,
        rentalCity: rentalCity,
        rentalPostalCode: rentalPostalCode,

        // tenancy
        product: tenancy.propertyDetails.product,
        rentDuration: tenancy.propertyDetails.rentDuration,
        rentAmount: tenancy.propertyDetails.rentAmount,
        tenancyID: randomID,
        // property manager
        PMName: tenancy.agencyName,
      }
    );

    // ! Post to Email service
    if (i18n.language === "en") {
      await axios.post(`${REACT_APP_BASE_URL_EMAIL}/en/rj1`, {
        tenantsName: tenancy.tenantDetails.tenantName,
        tenantsEmail: tenancy.tenantDetails.tenantEmail,
        tenantsPhone: tenancy.tenantDetails.tenantPhone,
        agencyName: tenancy.agencyName,
        agencyContactPerson: tenancy.agencyContactPerson,
        agencyPhonePerson: tenancy.agencyPhonePerson,
        agencyEmailPerson: tenancy.agencyEmailPerson,
        rentDuration: tenancy.propertyDetails.rentDuration,
        product: tenancy.propertyDetails.product,
        rentAmount: tenancy.propertyDetails.rentAmount,
        rentalAddress: fullRentalAddress,
        rentalPostalCode: rentalPostalCode,
        rentalCity: rentalCity,
        randomID,
      });
    } else {
      await axios.post(`${REACT_APP_BASE_URL_EMAIL}/rj1`, {
        tenantsName: tenancy.tenantDetails.tenantName,
        tenantsEmail: tenancy.tenantDetails.tenantEmail,
        tenantsPhone: tenancy.tenantDetails.tenantPhone,
        agencyName: tenancy.agencyName,
        agencyContactPerson: tenancy.agencyContactPerson,
        agencyPhonePerson: tenancy.agencyPhonePerson,
        agencyEmailPerson: tenancy.agencyEmailPerson,
        rentDuration: tenancy.propertyDetails.rentDuration,
        product: tenancy.propertyDetails.product,
        rentAmount: tenancy.propertyDetails.rentAmount,
        rentalAddress: fullRentalAddress,
        rentalPostalCode: rentalPostalCode,
        rentalCity: rentalCity,
        randomID,
      });
    }

    setStep(step + 1);
  };

  const services = ["Administración", "Gestión", "Protección"];

  // ! Google maps Autocomplete
  const [fullRentalAddress, setFullRentalAddress] = useState("");
  const [rentalAddress, setRentalAddress] = useState("");
  const [rentalCity, setRentalCity] = useState("");
  const [rentalPostalCode, setRentalPostalCode] = useState("");

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
      setRentalAddress(results[0].address_components[0].long_name);
      setRentalCity(results[0].address_components[1].long_name);
      setRentalPostalCode("");
      setFullRentalAddress(results[0].formatted_address);
    } else if (
      addressComponents[0].types[0] === streetNumber && // number
      addressComponents[1].types[0] === route && // Street
      addressComponents[2].types[0] === locality && // Barcelona
      addressComponents[6].types[0] === postalCode
    ) {
      setRentalAddress(results[0].address_components[1].long_name);
      setRentalCity(results[0].address_components[2].long_name);
      setRentalPostalCode(results[0].address_components[6].long_name);
      setFullRentalAddress(results[0].formatted_address);
    }

    setFullRentalAddress(results[0].formatted_address);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.RegisterForm}>
      <div className={style.FormIntern}>
        <div className={style.GroupInput}>
          <div className={style.FormLeft}>
            <div className={styles.selectContainer}>
              <label className={styles.selectLabel} htmlFor="product">
                {t("RJ1.stepTwo.service")}
              </label>
              <select
                required
                name="product"
                className={styles.selectInput}
                value={tenancy.propertyDetails.product}
                onChange={(e) => handleAgency(e)}
                error={errors.product}
              >
                <option value="">{t("RJ1.stepTwo.servicePL")}</option>
                {services.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={style.FormLeft}>
            <Input
              type="text"
              name="rentDuration"
              value={tenancy.propertyDetails.rentDuration}
              label={t("RJ1.stepTwo.rentDuration")}
              placeholder={t("RJ1.stepTwo.rentDurationPL")}
              onChange={(e) => handleAgency(e)}
              error={errors.rentDuration}
            />
          </div>
          <div className={style.FormLeft}>
            <Input
              type="text"
              name="rentAmount"
              value={tenancy.propertyDetails.rentAmount}
              label={t("RJ1.stepTwo.rentAmount")}
              placeholder={t("RJ1.stepTwo.rentAmountPL")}
              onChange={(e) => handleAgency(e)}
              error={errors.rentAmount}
            />
          </div>
        </div>

        <div className={style.GroupInput}>
          <div className={style.FormLeft}>
            {/* Google maps Autocomplete */}
            <PlacesAutocomplete
              value={fullRentalAddress}
              onChange={setFullRentalAddress}
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
                    label={t("RJ1.stepTwo.completeRentalAddress")}
                    placeholder={t("RJ1.stepTwo.completeRentalAddressPL")}
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
                          {...getSuggestionItemProps(suggestion, { style })}
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
              name="rentalAddressSecond"
              id="rentalAddressSecond"
              value={tenancy.propertyDetails.rentalPostalCode}
              label={t("RJ1.stepTwo.rentalAddressSecond")}
              placeholder={t("RJ1.stepTwo.rentalAddressSecondPL")}
              onChange={(e) => handleAgency(e)}
              required
            />
          </div>

          <div className={style.FormLeft}>
            <Input
              type="text"
              name="rentalPostalCode"
              id="rentalPostalCode"
              value={rentalPostalCode}
              label={t("RJ1.stepTwo.rentalPostalCode")}
              placeholder={t("RJ1.stepTwo.rentalPostalCodePL")}
              onChange={setRentalPostalCode}
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
      </div>

      <div className={styles.TermsContainer}>
        <InputCheck
          type="checkbox"
          required
          name="isAgentAccepted"
          id="terms"
          value={tenancy.propertyDetails.isAgentAccepted}
          placeholder="Accept our terms and conditions"
          onChange={(e) => handleAgency(e)}
          error={errors.isAgentAccepted}
        />
        <p>
          {t("RJ1.stepTwo.pp1")}{" "}
          <a
            href="https://rimbo.rent/en/privacy-policy/"
            target="_blank"
            rel="noreferrer"
            className="link-tag"
          >
            {" "}
            {t("RJ1.stepTwo.pp2")}
          </a>{" "}
          {t("RJ1.stepTwo.pp3")}{" "}
          <a
            href="https://rimbo.rent/en/cookies-policy/"
            target="_blank"
            rel="noreferrer"
            className="link-tag"
          >
            {" "}
            {t("RJ1.stepTwo.pp4")}
          </a>
          .
        </p>
      </div>

      <div className={styles.ButtonContainer}>
        <Button onClick={() => setStep(step - 1)} type="button">
          {t("prevStepButton")}
        </Button>
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
  );
};

PropertyDetails.propTypes = {
  step: PropTypes.number,
  setStep: PropTypes.func,
  tenancy: PropTypes.object,
  setTenancy: PropTypes.func,
};

export default withNamespaces()(PropertyDetails);

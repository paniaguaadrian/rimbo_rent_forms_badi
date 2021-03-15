import React, { useState } from "react";
import PropTypes from "prop-types";
import { isProperty } from "./validation";
import styles from "../RegisterTenancy/register-user.module.scss";
import Input from "../Input";
import Button from "../Button";
import { UPDATE_PROPERTY_INFO } from "./constants";

const PropertyDetails = ({ step, setStep, tenancy, setTenancy }) => {
  const [errors, setErrors] = useState({});

  // Handle on change
  const handleAgency = ({ target }) => {
    setTenancy({
      type: UPDATE_PROPERTY_INFO,
      payload: { [target.name]: target.value },
    });
  };

  // Hanlde con next / continue
  const handleContinue = (e) => {
    e.preventDefault();
    const errors = isProperty(tenancy.propertyDetails);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(step + 1);
  };

  // Values for Select input
  const services = ["1 month", "2 months", "3 months"];

  return (
    <form onSubmit={handleContinue}>
      <div className={styles.FormIntern}>
        <div className={styles.FormLeft}>
          <div className={styles.selectContainer}>
            <label className={styles.selectLabel} htmlFor="product">
              Choose service
            </label>
            <select
              required
              name="product"
              className={styles.selectInput}
              value={tenancy.propertyDetails.product}
              onChange={(e) => handleAgency(e)}
              error={errors.product}
            >
              <option value="">Select Rimbo Service</option>
              {services.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <Input
            type="text"
            name="rentDuration"
            value={tenancy.propertyDetails.rentDuration}
            label="Duration rental agreement (years)"
            placeholder="Enter duration"
            onChange={(e) => handleAgency(e)}
            error={errors.rentDuration}
          />
          <Input
            type="text"
            name="rentAmount"
            value={tenancy.propertyDetails.rentAmount}
            label="Monthly rent (in €)"
            placeholder="Enter rent"
            onChange={(e) => handleAgency(e)}
            error={errors.rentAmount}
          />
        </div>
        <div className={styles.FormRight}>
          <Input
            type="text"
            name="rentalAddress"
            value={tenancy.propertyDetails.rentalAddress}
            label="Address of the property"
            placeholder="Enter address"
            onChange={(e) => handleAgency(e)}
            error={errors.rentalAddress}
          />
          <Input
            type="text"
            name="rentalCity"
            value={tenancy.propertyDetails.rentalCity}
            label="City"
            placeholder="Enter the city name"
            onChange={(e) => handleAgency(e)}
            error={errors.rentalCity}
          />
          <Input
            type="text"
            name="rentalPostalCode"
            value={tenancy.propertyDetails.rentalPostalCode}
            label="Postal code"
            placeholder="XXXXX"
            onChange={(e) => handleAgency(e)}
            error={errors.rentalPostalCode}
          />
        </div>
      </div>

      <div className={styles.ButtonContainer}>
        <Button onClick={() => setStep(step - 1)} type="button">
          Previous Step
        </Button>
        <Button type="submit">Next Step</Button>
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

export default PropertyDetails;

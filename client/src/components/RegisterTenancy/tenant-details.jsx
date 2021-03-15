import React, { useState } from "react";
import PropTypes from "prop-types";
import { isTenant } from "./validation";
import styles from "../RegisterTenancy/register-user.module.scss";
import Input from "../Input";
import Button from "../Button";
import { UPDATE_TENANT_INFO } from "./constants";

const TenantDetails = ({ step, setStep, tenancy, setTenancy }) => {
  const [errors, setErrors] = useState({});

  // Handle on change
  const handleTenant = ({ target }) => {
    setTenancy({
      type: UPDATE_TENANT_INFO,
      payload: { [target.name]: target.value },
    });
  };

  // Hanlde con next / continue
  const handleContinue = (e) => {
    e.preventDefault();
    const errors = isTenant(tenancy.tenantDetails);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(step + 1);
  };

  return (
    <form onSubmit={handleContinue}>
      <div className={styles.FormIntern}>
        <div className={styles.FormLeft}>
          <Input
            type="text"
            name="tenantName"
            value={tenancy.tenantDetails.tenantName}
            label="Tenant's full name"
            placeholder="Enter name and surname"
            onChange={(e) => handleTenant(e)}
            error={errors.tenantName}
          />
          <Input
            type="email"
            name="tenantEmail"
            value={tenancy.tenantDetails.tenantEmail}
            label="Tenant's email"
            placeholder="Enter a valid email address"
            onChange={(e) => handleTenant(e)}
            error={errors.tenantEmail}
          />
        </div>
        <div className={styles.FormRight}>
          <Input
            type="text"
            name="tenantPhone"
            value={tenancy.tenantDetails.tenantPhone}
            label="Tenant's phone number"
            placeholder="Enter phone number"
            onChange={(e) => handleTenant(e)}
            error={errors.tenantPhone}
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

TenantDetails.propTypes = {
  step: PropTypes.number,
  setStep: PropTypes.func,
  tenancy: PropTypes.object,
  setTenancy: PropTypes.func,
};

export default TenantDetails;

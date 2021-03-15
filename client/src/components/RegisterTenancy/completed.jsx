import React from "react";
import PropTypes from "prop-types";
import styles from "../RegisterTenancy/register-user.module.scss";

const Completed = ({ tenancy }) => {
  return (
    <div className={styles.CompleteContainer}>
      <h1>
        Warm welcome {""}
        <b>
          {""}
          {`${tenancy.agencyContactPerson}`}
          {""}
        </b>
        {""} from <b> {`${tenancy.agencyName}`}</b>
      </h1>
      <h3>
        You have successfully registered{" "}
        <b>{`${tenancy.tenantDetails.tenantName}`}</b> as a new Tenant with
        Rimbo
      </h3>
      <p>
        We just sent you an email to <b>{`${tenancy.agencyEmailPerson}`}</b>{" "}
        with all the information and next instructions for you.
      </p>
      <h3>Best regards</h3>
    </div>
  );
};

Completed.propTypes = {
  tenancy: PropTypes.object,
};

export default Completed;

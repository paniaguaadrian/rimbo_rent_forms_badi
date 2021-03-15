import React, { useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Styles
import styles from "../approvedTenantRimbo/approved-user.module.scss";

const ApprovedTenantCardRimbo = () => {
  let { tenancyID } = useParams();
  const randomID = tenancyID;

  useEffect(() => {
    // Simplify fetchUserData.
    const fetchUserData = () =>
      axios.get(`http://localhost:8081/api/tenancies/tenancy/${tenancyID}`);

    const processDecision = async () => {
      const { data: tenancyData } = await fetchUserData();
      // let's console.log userData here, so we know it is in the right format.
      //   console.log(tenancyData);

      const { tenantsName, tenantsEmail } = tenancyData.tenant;

      const {
        agencyContactPerson,
        agencyEmailPerson,
        agencyName,
      } = tenancyData.agent;

      await axios.post("http://localhost:8080/submit-email/rj15", {
        tenantsName,
        tenantsEmail,
        agencyContactPerson,
        agencyEmailPerson,
        agencyName,
        tenancyID,
        randomID,
      });
    };

    processDecision();
  }, [randomID, tenancyID]);

  return (
    <div className={styles.SuccessPageContainer}>
      <div className={styles.SuccessPageText}>
        <h1>The tenant has been accepted after the debit card request.</h1>
        <h2>You have successfully accepted the tenant</h2>
        <p>
          The PM already recieves the RJ16 Email and the Tenant already recieves
          the RJXX5 Email.
        </p>
      </div>
    </div>
  );
};

export default ApprovedTenantCardRimbo;

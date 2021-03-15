// React components
import React, { useState, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet";

import axios from "axios";
import { useParams } from "react-router-dom";
import { TenantReducer, DefaultTenant } from "./approved_tenant_pm-reducer";

// Styles
import styles from "../approvedTenantRimbo/approved-user.module.scss";

const ApprovedTenantPM = () => {
  let { tenancyID } = useParams();
  const randomID = tenancyID;

  const [tenant] = useReducer(TenantReducer, DefaultTenant);
  const [state, setState] = useState(null); // eslint-disable-line

  useEffect(() => {
    // Simplify fetchUserData.
    const fetchUserData = () =>
      axios.get(`http://localhost:8081/api/tenancies/tenancy/${tenancyID}`);

    // Add body to post decision. So we can send data.
    const postDecision = (body) =>
      axios.post(
        `http://localhost:8081/api/tenants/tenant/${randomID}/pm/approved`,
        body
      );

    const processDecision = async () => {
      const { data: tenancyData } = await fetchUserData();
      // let's console.log userData here, so we know it is in the right format.
      // console.log(tenancyData);

      const postBody = {
        // use some logic based on tenancyData here to make the postBody
        isPMAccepted: tenant.isPMAccepted,
        randomID: tenancyData.tenant.randomID,
      };

      // If the above use of {data} is correct it should be correct here too.
      const { data: decisionResult } = await postDecision(postBody);
      // console.log(postBody);

      const {
        tenantsName,
        tenantsEmail,
        tenantsPhone,
        monthlyNetIncome,
        jobType,
        documentNumber,
        randomID,
      } = tenancyData.tenant;

      const {
        agencyContactPerson,
        agencyEmailPerson,
        agencyName,
        agencyPhonePerson,
      } = tenancyData.agent;

      const {
        rentalAddress,
        rentalCity,
        rentalPostalCode,
      } = tenancyData.property;

      const { rentAmount, product, rentDuration } = tenancyData;

      const tenancyID = tenancyData.tenancyID;

      // Don't send an email if the tenant is already accepted
      if (tenancyData.tenant.isPMAccepted === false) {
        axios.post("http://localhost:8080/submit-email/rjpm", {
          tenancyID,
          randomID,
          tenantsName,
          tenantsEmail,
          tenantsPhone,
          monthlyNetIncome,
          jobType,
          documentNumber,
          agencyContactPerson,
          agencyEmailPerson,
          agencyName,
          agencyPhonePerson,
          rentAmount,
          product,
          rentDuration,
          rentalAddress,
          rentalCity,
          rentalPostalCode,
        });
      }

      setState(decisionResult);
    };

    processDecision();
  }, [randomID, tenant.isPMAccepted, tenancyID]);

  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(
    () => {
      const getData = () => {
        fetch(`http://localhost:8081/api/tenants/tenant/${randomID}`)
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
    [randomID],
    [responseData, loading, err]
  );

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

        <title>Approved - Rimbo - The new way to rent</title>
      </Helmet>
      <div className={styles.SuccessPageContainer}>
        <div className={styles.SuccessPageText}>
          <h1>The tenant has been accepted</h1>
          <h2>You have successfully accepted the tenant</h2>
          <p>
            The tenant <b>{responseData.tenantsName}</b> is accepted
          </p>
          <p>
            Both you and the tenant will receive an email with the details of
            the process
          </p>
        </div>
      </div>
    </>
  );
};

export default ApprovedTenantPM;

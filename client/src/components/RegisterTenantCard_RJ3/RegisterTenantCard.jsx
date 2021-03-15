// React Components
import React, { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { TenantStripeReducer, DefaultTenant } from "./tenantStripe-reducer";

// Stripe Components
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Constants
import { UPDATE_NEWTENANT_INFO } from "./tenantStripe-constants";

// Styles
import Loader from "react-loader-spinner";
import styles from "../RegisterTenancy/register-user.module.scss";
import "./CardSection.css";
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

const RegisterTenantCard = () => {
  let { randomID } = useParams();
  const tenancyID = randomID;

  const [tenant, setTenant] = useReducer(TenantStripeReducer, DefaultTenant);

  const [isProcessing, setProcessingTo] = useState(false);
  const [checkoutError, setCheckoutError] = useState();

  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const [tenancyData, setTenancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null); //eslint-disable-line

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
          (tenancyData) => {
            setTenancyData(tenancyData);
            setLoading(false);
          },
          (err) => {
            setErr(err);
            setLoading(false);
          }
        );
    };
    getData();
  }, [tenancyID]);

  // Handle on change
  const handleNewTenant = ({ target }) => {
    setTenant({
      type: UPDATE_NEWTENANT_INFO,
      payload: { [target.name]: target.value },
    });
  };

  const handleCardDetailsChange = (ev) => {
    ev.error ? setCheckoutError(ev.error.message) : setCheckoutError();
  };

  const handleFormSubmit = async (ev) => {
    ev.preventDefault();
    const tenantsEmail = document.getElementById("email").innerHTML;
    const tenantsName = document.getElementById("name").innerHTML;
    const tenantsPhone = document.getElementById("phone").innerHTML;
    const timestamps = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");

    const cardElement = elements.getElement("card");

    setProcessingTo(true);

    // ! Development / Production API's
    // * Stripe Action
    // "http://localhost:8081/stripe/card-wallet" (D)
    // `${NOMBRE}` (P)
    // * Emails Action
    // "http://localhost:8081/submit-email/rj1" (D)
    // `${NOMBRE}` (P)
    // * Send data to Rimbo API
    // "http://localhost:8081/api/enso/tenants" (D)
    // `${api_rimbo_enso_tenant}` (P)

    try {
      // ! Post a el basckend de stripe en formularios
      const { data: client_secret } = await axios.post(
        "http://localhost:8080/stripe/card-wallet",
        {
          tenantsName,
          tenantsEmail,
        }
      );

      const { error } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: tenantsName,
            email: tenantsEmail,
            phone: tenantsPhone,
          },
        },
      });

      if (error) {
        setCheckoutError("* Rellena todos los campos del formulario.");
        setProcessingTo(false);
        return;
      } else {
        setIsSuccessfullySubmitted(true);

        // ! post a nuestra BDD
        await axios.post(
          `http://localhost:8081/api/tenants/stripe/${randomID}`,
          {
            isAccepted: tenant.isAccepted,
            randomID: randomID,
          }
        );

        // ! Post a el backend de emails en formularios
        await axios.post("http://localhost:8080/submit-email/rj3", {
          tenantsName,
          tenantsEmail,
          tenantsPhone,
          timestamps,
          agencyEmailPerson: tenancyData.agent.agencyEmailPerson,
          agencyContactPerson: tenancyData.agent.agencyContactPerson,
          agencyName: tenancyData.agent.agencyName,
          rentalAddress: tenancyData.property.rentalAddress,
          randomID,
          tenancyID,
        });
      }
    } catch (err) {
      setCheckoutError(err.message);
    }
  };

  return (
    <>
      {!isSuccessfullySubmitted ? (
        <div className={styles.RegisterContainer}>
          {loading ? (
            <div className={styles.Register}>
              <Loader
                type="Puff"
                color="#01d2cc"
                height={200}
                width={200}
                timeout={3000} //3 secs
              />
            </div>
          ) : (
            <>
              <div className={styles.Register}>
                <h1>
                  Great! You are just one step away from renting without a
                  deposit!
                </h1>
                <div className={styles.ExtraInfoContainer}>
                  <h2>
                    You just need to review our Terms and Conditions and provide
                    the charge authorization
                  </h2>
                  <div>
                    <p>
                      * The card will NOT be blocked. The card will NOT be
                      charged now. Only in case of legal claims presented by the
                      landlord the card will be charged, import limited to{" "}
                      <span>{tenancyData.product} of rent.</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.CardContainer}>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.CardInput}>
                    <label>
                      <h3>Debit card details</h3>
                      <div>
                        <p id="name">{tenancyData.tenant.tenantsName}</p>
                        <p id="email">{tenancyData.tenant.tenantsEmail}</p>
                        <p id="phone">{tenancyData.tenant.tenantsPhone}</p>
                      </div>

                      <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardDetailsChange}
                      />
                    </label>
                    <div className={styles.ErrorInput}>
                      <p className="error-message">{checkoutError}</p>
                    </div>
                  </div>

                  <div className={styles.TermsContainerStripe}>
                    <input
                      type="checkbox"
                      required
                      name="isAccepted"
                      id="terms"
                      value={tenant.isAccepted}
                      onChange={(e) => handleNewTenant(e)}
                    />
                    <p>
                      By hiring Rimbo's Services, you accept the{" "}
                      <a
                        href="https://rimbo.rent/politica-privacidad/"
                        target="_blank"
                        rel="noreferrer"
                        className="link-tag"
                      >
                        {" "}
                        Rimbo general conditions
                      </a>
                    </p>
                  </div>

                  {isProcessing ? (
                    <Loader
                      type="Puff"
                      color="#01d2cc"
                      height={50}
                      width={50}
                      timeout={3000} //3 secs
                    />
                  ) : (
                    <button disabled={isProcessing || !stripe}>
                      Authorize
                    </button>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.SuccessPageContainer}>
          <div className={styles.SuccessPageText}>
            <h1>Your payment has been successfully completed</h1>
            <h4>You will shortly receive an email with more details.</h4>
            <p>
              Thanks for your time <b>{tenancyData.tenant.tenantsName}</b>, We
              will contact you shortly to give you more details of the process.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterTenantCard;

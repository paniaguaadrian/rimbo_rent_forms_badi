// React Components
import React from "react";
import { Helmet } from "react-helmet";

// Styles
// import styles from "./approved-user.module.scss";
import styles from "../approvedTenantRimbo/approved-user.module.scss";

const Home = () => {
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

        <title>Approved- Rimbo - The new way to rent</title>
      </Helmet>
      <div className={styles.SuccessPageContainer}>
        <div className={styles.SuccessPageText}>
          <h1>Bienvenid@ a la unión entre Rimbo y Badi</h1>
          <h2>Si eres un agente, ponte en contacto con...</h2>

          <p>Si quieres saber más de.... haz lo siguiente...</p>
        </div>
      </div>
    </>
  );
};

export default Home;

import React, { useReducer, useState } from "react";
import { TenancyReducer, DefaultTenancy } from "./tenancy-reducer";
import styles from "./register-user.module.scss";
import FormSteps from "./form-steps";

const RegisterTenancy = () => {
  let [step, setStep] = useState(0);
  const [tenancy, setTenancy] = useReducer(TenancyReducer, DefaultTenancy);
  let steps = FormSteps(step, setStep, tenancy, setTenancy);
  return (
    <div className={styles.RegisterContainer}>
      <div className={styles.Register}>
        <h1>List your tenant for screening</h1>
        <div className={styles.ExtraInfoContainer}>
          <p>Fill out the fields.</p>
          <p>Rimbo screens in 24 hours.</p>
          <p>Receive a response via email.</p>
        </div>
        {step === 0 || step === 1 || step === 2 || step === 3 ? (
          <h4>
            Step {step + 1} / {steps.length - 1} -{" "}
            <span>{steps[`${step}`].title}</span>
          </h4>
        ) : (
          <h4>
            <span>{steps[`${step}`].title}</span>
          </h4>
        )}
      </div>
      <div className={styles.FormContent}>{steps[`${step}`].content}</div>
    </div>
  );
};

export default RegisterTenancy;

// ! Production Constants
// export const api_rimbo_tenancies = process.env.API_RIMBO_TENANCIES;
// export const api_rimbo_tenancy = process.env.API_RIMBO_TENANCY;
// export const api_rimbo_tenant = process.env.API_RIMBO_TENANT;
// export const api_rimbo_tenant_upload = process.env.API_RIMBO_TENANT_UPLOAD;
// export const api_rimbo_tenant_card = process.env.API_RIMBO_TENANT_CARD;
// export const api_rimbo_tenancy_badi = process.env.API_RIMBO_TENANCY_BADI;
// export const api_rimbo_tenant_pm_approve =
//   process.env.API_RIMBO_TENANT_PM_APPROVE;
// export const api_rimbo_tenant_rimbo_approve =
//   process.env.API_RIMBO_TENANT_RIMBO_APPROVE;
// export const api_rimbo_tenancies_rimbo_start =
//   process.env.API_RIMBO_TENANCIES_RIMBO_START;
// export const api_stripe_action = process.env.STRIPE_ACTION;
// export const api_email_rj1 = process.env.SE_RJ1;
// export const api_email_rj2_tt = process.env.SE_RJ2_TT;
// export const api_email_rj2_rimbo = process.env.SE_RJ2_RIMBO;
// export const api_email_rj3 = process.env.SE_RJ3;
// export const api_email_rjs = process.env.SE_RJS;
// export const api_email_rjpm = process.env.SE_RJPM;
// export const api_email_rj11 = process.env.SE_RJ11;
// export const api_email_rj15 = process.env.SE_RJ15;
// export const api_email_rj18 = process.env.SE_RJ18;

// ! Development Constants
export const api_rimbo_tenancies = "http://localhost:8081/api/tenancies";

// export const api_rimbo_tenancy = `http://localhost:8081/api/tenancies/tenancy/${tenancyID}`;

export const api_rimbo_tenant = (randomID) =>
  `http://localhost:8081/api/tenants/tenant/${randomID}`;

export const api_rimbo_tenant_upload = (randomID) =>
  `http://localhost:8081/api/tenants/tenant/${randomID}/upload`;

export const api_rimbo_tenant_card = (randomID) =>
  `http://localhost:8081/api/tenants/stripe/${randomID}`;

export const api_rimbo_tenancy_badi = (tenancyID) =>
  `http://localhost:8081/api/tenancies/tenancy/badi/${tenancyID}`;

export const api_rimbo_tenant_pm_approve = (randomID) =>
  `http://localhost:8081/api/tenants/tenant/${randomID}/pm/approved`;

export const api_rimbo_tenant_rimbo_approve = (randomID) =>
  `http://localhost:8081/api/tenants/tenant/${randomID}/approved`;

export const api_rimbo_tenancies_rimbo_start = (tenancyID) =>
  `http://localhost:8081/api/tenancies/tenancy/${tenancyID}/rimbo/start-service`;

export const api_stripe_action = "http://localhost:8080/stripe/card-wallet";
export const api_email_rj1 = "http://localhost:8080/submit-email/rj1";
export const api_email_rj2_tt = "http://localhost:8080/submit-email/rj2/tt";
export const api_email_rj2_rimbo =
  "http://localhost:8080/submit-email/rj2/rimbo";
export const api_email_rj3 = "http://localhost:8080/submit-email/rj3";
export const api_email_rjs = "http://localhost:8080/submit-email/rjs";
export const api_email_rjpm = "http://localhost:8080/submit-email/rjpm";
export const api_email_rj11 = "http://localhost:8080/submit-email/rj11";
export const api_email_rj15 = "http://localhost:8080/submit-email/rj15";
export const api_email_rj18 = "http://localhost:8080/submit-email/rj18";

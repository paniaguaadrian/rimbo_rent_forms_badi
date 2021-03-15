// React Components
import { Route } from "react-router-dom";

// Custom Components
import RegisterTenancy from "./components/RegisterTenancy";
import RegisterTenant from "./components/RegisterTenant_RJ2/RegisterTenant";
import StripeHandler from "./components/RegisterTenantCard_RJ3/StripeHandlerComponent";
import ApprovedTenantRimbo from "./screens/approvedTenantRimbo/ApprovedTenantRimbo";
import RejectedTenantRimbo from "./screens/approvedTenantRimbo/RejectedTenantRimbo";
import ApprovedTenantPM from "./screens/approvedTenantPM/ApprovedTenantPM";
import ApprovedTenantCardRimbo from "./screens/approvedTenantCardRimbo/ApprovedTenantCardRimbo";
import RegisterTenantPM from "./components/RegisterTenantPM_RJS/RegisterTenantPM";
import ApprovedTenancyRimbo from "./screens/approvedTenancyRimbo/ApprovedTenancyRimbo";

// Normalize & Generic styles
import "./styles/generic.scss";

const App = () => {
  return (
    <>
      <Route exact path="/register/rj1" component={RegisterTenancy} />
      <Route exact path="/register/rj2/:tenancyID" component={RegisterTenant} />
      <Route
        exact
        path="/register/rj2/:tenancyID/approved"
        component={ApprovedTenantRimbo}
      />
      <Route
        exact
        path="/register/rj2/:tenancyID/rejected"
        component={RejectedTenantRimbo}
      />
      <Route
        exact
        path="/register/rj2/:tenancyID/pm/approved"
        component={ApprovedTenantPM}
      />
      <Route
        exact
        path="/register/rj3/:tenancyID/card/approved"
        component={ApprovedTenantCardRimbo}
      />
      <Route exact path="/register/rj3/:randomID" component={StripeHandler} />
      <Route
        exact
        path="/register/rjs/:tenancyID"
        component={RegisterTenantPM}
      />
      <Route
        exact
        path="/register/rjs/:tenancyID/service-start"
        component={ApprovedTenancyRimbo}
      />
    </>
  );
};

export default App;

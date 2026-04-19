import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import FarmerDashboard from "./components/FarmerDashboard";
import DiagnoseCrop from "./components/DiagnoseCrop";
import DiagnosisHistory from "./components/DiagnosisHistory";
import DiagnosisDetail from "./components/DiagnosisDetail";
import ScoreDetails from "./components/ScoreDetails";
import FarmerSettings from "./components/FarmerSettings";
import LoanApply from "./components/LoanApply";
import LenderDashboard from "./components/LenderDashboard";
import HowItWorks from "./components/HowItWorks";
import AboutFarmers from "./components/AboutFarmers";
import AboutLenders from "./components/AboutLenders";
import { getToken, getLenderToken } from "./services/api";

// Route guards
function RequireFarmerAuth({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireLenderAuth({ children }: { children: React.ReactNode }) {
  const token = getLenderToken();
  if (!token) return <Navigate to="/lender-login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: Auth },
      { path: "register", Component: Auth },
      { path: "lender-login", Component: Auth },
      { path: "for-farmers", Component: AboutFarmers },
      { path: "for-lenders", Component: AboutLenders },
      { path: "how-it-works", Component: HowItWorks },
      {
        path: "dashboard",
        element: <RequireFarmerAuth><FarmerDashboard /></RequireFarmerAuth>,
      },
      {
        path: "diagnose",
        element: <RequireFarmerAuth><DiagnoseCrop /></RequireFarmerAuth>,
      },
      {
        path: "history",
        element: <RequireFarmerAuth><DiagnosisHistory /></RequireFarmerAuth>,
      },
      {
        path: "diagnosis/:id",
        element: <RequireFarmerAuth><DiagnosisDetail /></RequireFarmerAuth>,
      },
      {
        path: "score",
        element: <RequireFarmerAuth><ScoreDetails /></RequireFarmerAuth>,
      },
      {
        path: "settings",
        element: <RequireFarmerAuth><FarmerSettings /></RequireFarmerAuth>,
      },
      {
        path: "loan-apply",
        element: <RequireFarmerAuth><LoanApply /></RequireFarmerAuth>,
      },
      {
        path: "lender",
        element: <RequireLenderAuth><LenderDashboard /></RequireLenderAuth>,
      },
    ],
  },
]);

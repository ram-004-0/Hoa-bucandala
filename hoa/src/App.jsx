import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { useEffect } from "react";

import RootLayout from "./layout/RootLayout";
import { startAutoLogout } from "../../backend/utils/auth.js";
import ProtectedRoute from "../src/components/ProtectedRoutes.jsx";

// Public
import Login from "./pages/Login";

// Resident
import Home from "./pages/Home";
import AmenityReservation from "./pages/dashboardpages/AmenityReservation";
import ClubHouse from "./pages/dashboardpages/amenitypages/ClubHouse";
import SwimmingPool from "./pages/dashboardpages/amenitypages/SwimmingPool";
import BasketballCourt from "./pages/dashboardpages/amenitypages/BasketballCourt";
import HOAdues from "./pages/dashboardpages/HOAdues";
import PaymentHistory from "./pages/dashboardpages/PaymentHistory";
import WasteCollection from "./pages/dashboardpages/WasteCollection";
import Announcement from "./pages/dashboardpages/Announcement";
import SecurityAssistance from "./pages/dashboardpages/SecurityAssistance";
import VisitorRegistration from "./pages/dashboardpages/VisitorRegistration";
import ProfileSettings from "./props/ProfileSettings";
import ReportUncollected from "./pages/dashboardpages/wastecollectionpages/ReportUncollected";
import ReportOverflow from "./pages/dashboardpages/wastecollectionpages/ReportOverflow";
import NotificationCenter from "./props/NotificationCenter.jsx";
import SuccessReservation from "./props/SuccessResevation.jsx";

// Waste
import ScheduleBiodegradable from "./pages/dashboardpages/wastecollectionpages/BookBiodegradable";
import ScheduleRecyclable from "./pages/dashboardpages/wastecollectionpages/ScheduleRecyclable";
import ScheduleNonBiodegradable from "./pages/dashboardpages/wastecollectionpages/BookNonBiodegradable";
import ResidentPickups from "./pages/dashboardpages/wastecollectionpages/ResidentPickups.jsx";

// Security
import NoiseComplaint from "./pages/dashboardpages/securityassistancepages/NoiseComplaint";
import GuardRequest from "./pages/dashboardpages/securityassistancepages/GuardRequest";
import SuspisciousActivity from "./pages/dashboardpages/securityassistancepages/SuspisciousActivity";

// Guard
import GuardDashboard from "./pages/guard/GuardDashboard";
import VisitorList from "./pages/guard/pages/VisitorList";
import VisitorLog from "./pages/guard/pages/VisitorLog";
import SecurityAlerts from "./pages/guard/pages/SecurityAlerts";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageResidents from "./pages/admin/adminpages/ManageResidents";
import ManageReservations from "./pages/admin/adminpages/ManageReservation";
import ManageWaste from "./pages/admin/adminpages/ManageWaste";
import ManageReports from "./pages/admin/adminpages/ManageReports";
import CreateAnnouncement from "./pages/admin/adminpages/CreateAnnouncement";
import ViewPickups from "./pages/admin/adminpages/ViewPickups.jsx";
import ManagePayments from "./pages/admin/adminpages/ManagePayments.jsx";
const App = () => {
  useEffect(() => {
    startAutoLogout();
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        {/* PUBLIC */}
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />

        {/* RESIDENT */}
        <Route
          path="home"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="amenities"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <AmenityReservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="amenities/clubhouse"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ClubHouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="amenities/swimmingpool"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <SwimmingPool />
            </ProtectedRoute>
          }
        />
        <Route
          path="amenities/basketballcourt"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <BasketballCourt />
            </ProtectedRoute>
          }
        />

        <Route
          path="hoadues"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <HOAdues />
            </ProtectedRoute>
          }
        />
        <Route
          path="hoadues/payment-history"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <PaymentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="wastecollection"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <WasteCollection />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/bookbiodegradable"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ScheduleBiodegradable />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/booknonbiodegradable"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ScheduleNonBiodegradable />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/bookrecyclable"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ScheduleRecyclable />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/my-history"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ResidentPickups />
            </ProtectedRoute>
          }
        />

        <Route
          path="announcements"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <Announcement />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="securityassistance"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <SecurityAssistance />
            </ProtectedRoute>
          }
        />
        <Route
          path="securityassistance/noisecomplaint"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <NoiseComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="securityassistance/guardrequest"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <GuardRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="securityassistance/suspisciousactivity"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <SuspisciousActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="visitorregistration"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <VisitorRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/report-uncollected"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ReportUncollected />
            </ProtectedRoute>
          }
        />
        <Route
          path="wastecollection/report-overflow"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <ReportOverflow />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <NotificationCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="amenities/success"
          element={
            <ProtectedRoute roles={["RESIDENT"]}>
              <SuccessReservation />
            </ProtectedRoute>
          }
        />

        {/* GUARD */}
        <Route
          path="guard"
          element={
            <ProtectedRoute roles={["GUARD"]}>
              <GuardDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="guard/security-alerts"
          element={
            <ProtectedRoute roles={["GUARD"]}>
              <SecurityAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="guard/visitor-list"
          element={
            <ProtectedRoute roles={["GUARD"]}>
              <VisitorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="guard/visitor-log"
          element={
            <ProtectedRoute roles={["GUARD"]}>
              <VisitorLog />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-residents"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ManageResidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-payments"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ManagePayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-reservations"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ManageReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-waste"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ManageWaste />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/manage-reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ManageReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/create-announcement"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <CreateAnnouncement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/view-pickups"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ViewPickups />
            </ProtectedRoute>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};

export default App;

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import the bouncer

// Page Imports
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Community from "./pages/Community";
import Calculator from "./pages/Calculator";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import UserAccount from "./pages/UserAccount";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import DestinationDashboard from "./pages/DestinationDashboard";
import DestinationRegistration from "./pages/DestinationRegistration";
import UpdatePassword from "./pages/UpdatePassword";
import Chatbot from "@/components/Chatbot";


const App = () => (
  <>
    <Routes>
      {/* --- Public Routes (Anyone can see these) --- */}
      <Route path="/" element={<Index />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/community" element={<Community />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<Help />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      
      {/* This page MUST be public so users who are not logged in can access it */}
      <Route path="/update-password" element={<UpdatePassword />} />


      {/* --- Protected Routes (Only logged-in users can see these) --- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<UserAccount />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/my-destinations" element={<DestinationDashboard />} />
        <Route path="/register-destination" element={<DestinationRegistration />} />
      </Route>
      

      {/* The catch-all "*" route must always be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Chatbot />
  </>
);

export default App;

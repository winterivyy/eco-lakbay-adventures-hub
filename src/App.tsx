import { Routes, Route } from "react-router-dom";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Community from "./pages/Community";
import Calculator from "./pages/Calculator";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserAccount from "./pages/UserAccount";
import DestinationRegistration from "./pages/DestinationRegistration";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import DestinationDashboard from "./pages/DestinationDashboard";
import UpdatePassword from "./pages/UpdatePassword";

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/community" element={<Community />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/account" element={<UserAccount />} />
      <Route path="/register-destination" element={<DestinationRegistration />} />
      <Route path="/help" element={<Help />} />
      <Route path="/my-destinations" element={<DestinationDashboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Chatbot />
  </>
);

export default App;

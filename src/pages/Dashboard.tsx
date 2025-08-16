import { useUserRole } from "@/hooks/useUserRole";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Dashboard = () => {
    // The ProtectedRoute component ensures the user is logged in before rendering this page.
    // This component's only job is to decide which version of the dashboard to show.
    const { isAdmin, loading: roleLoading } = useUserRole();

    // Show a loading state while we determine the user's role.
    if (roleLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navigation />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                </div>
                <Footer />
            </div>
        );
    }

    // Render the appropriate dashboard based on the user's role.
    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;

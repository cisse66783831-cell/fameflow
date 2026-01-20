import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/Index";
import CampaignPage from "./pages/Campaign";
import EventsPage from "./pages/Events";
import AdminEventsPage from "./pages/AdminEvents";
import WalletPage from "./pages/Wallet";
import ScannerPage from "./pages/Scanner";
import TicketPurchasePage from "./pages/TicketPurchase";
import SuperAdminPage from "./pages/SuperAdmin";
import CampaignBySlugPage from "./pages/CampaignBySlug";
import CGV from "./pages/CGV";
import RefundPolicy from "./pages/RefundPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";

// Redirect component for old /v/:slug URLs
const VideoSlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/admin/events" element={<AdminEventsPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/event/:eventId/ticket" element={<TicketPurchasePage />} />
                <Route path="/super-admin" element={<SuperAdminPage />} />
                {/* Legal & Institutional pages */}
                <Route path="/cgv" element={<CGV />} />
                <Route path="/politique-remboursement" element={<RefundPolicy />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {/* Redirect old /v/:slug to unified /:slug */}
                <Route path="/v/:slug" element={<VideoSlugRedirect />} />
                <Route path="/c/:id" element={<CampaignPage />} />
                <Route path="/:slug" element={<CampaignBySlugPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="/500" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

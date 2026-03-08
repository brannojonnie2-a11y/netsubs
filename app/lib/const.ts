export function getLoginUrl() {
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  }
  return `${window.location.origin}/login`;
}

export function useTelegram() {
  const webApp = window.Telegram.WebApp;

  return { webApp: webApp, user: webApp.initDataUnsafe?.user }
}

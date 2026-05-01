export interface AppConfig {
  BACKEND_URL: string;
  KEYCLOAK_URL: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT: string;

  ROLE_GUEST: string;
  ROLE_ADMINISTRATOR: string;
  ROLE_TRANSLATOR: string;
  ROLE_VALIDATOR: string;
}

declare global {
  interface Window {
    __APP_CONFIG__: AppConfig;
  }
}
function getConfig(): AppConfig {
  if (!window.__APP_CONFIG__) {
    throw new Error("App config not found. Did you forget to load config.js?");
  }

  return window.__APP_CONFIG__;
}

export const config = getConfig();

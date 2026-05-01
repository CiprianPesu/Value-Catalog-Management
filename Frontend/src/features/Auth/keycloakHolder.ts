import Keycloak from "keycloak-js";

let keycloak: Keycloak | null = null;

export const setKeycloakHolder = (kc: Keycloak) => {
  keycloak = kc;
};

export const getKeycloakHolder = () => keycloak;

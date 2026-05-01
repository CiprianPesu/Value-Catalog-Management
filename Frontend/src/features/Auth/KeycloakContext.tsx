import React, { createContext, useEffect, useState, useRef } from "react";
import Keycloak from "keycloak-js";
import { setKeycloakHolder } from "./keycloakHolder";
import { config } from "@/config";

interface KeycloakContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextProps | undefined>(undefined);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const isRun = useRef<boolean>(false);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;

    const initKeycloak = async () => {
      const keycloackConfig = {
        url: config.KEYCLOAK_URL as string,
        realm: config.KEYCLOAK_REALM as string,
        clientId: config.KEYCLOAK_CLIENT as string,
      };
      const keycloakInstance: Keycloak = new Keycloak(keycloackConfig);

      keycloakInstance
        .init({
          onLoad: "check-sso",
        })
        .then((authenticated: boolean) => {
          setAuthenticated(authenticated);
        })
        .catch((error) => {
          console.error("Keycloak initialization failed:", error);
          setAuthenticated(false);
        })
        .finally(() => {
          setKeycloak(keycloakInstance);
        });
    };

    initKeycloak();
  }, []);

  useEffect(() => {
    if (keycloak) {
      setKeycloakHolder(keycloak);
    }
  }, [keycloak]);

  return <KeycloakContext.Provider value={{ keycloak, authenticated }}>{children}</KeycloakContext.Provider>;
};

export { KeycloakProvider, KeycloakContext };

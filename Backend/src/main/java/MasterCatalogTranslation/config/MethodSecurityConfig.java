package MasterCatalogTranslation.config;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
    // no additional config needed for basic role checks
}

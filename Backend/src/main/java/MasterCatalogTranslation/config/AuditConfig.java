package MasterCatalogTranslation.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.PlatformTransactionManager;
import audit.context.AuditResolver;

@Configuration
public class AuditConfig {

    @Value("${audit.applicationName}")
    private String applicationName;

    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    /**
     * Overrides the AuditResolver interface provided by the Audit library
     * Necessary for the correct logging of the user and application identifier
     */
    @Bean
    public AuditResolver auditUserResolver() {
        return new AuditResolver() {
            @Override
            public String resolveCurrentUser() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (!(authentication instanceof JwtAuthenticationToken)
                        || !authentication.isAuthenticated()) {
                    return null;
                }

                Jwt jwt = (Jwt) authentication.getPrincipal();

                return jwt.getClaim("name");
            }

            @Override
            public String resolveApplicationIdentifier() {
                return applicationName;
            }
        };
    }
}
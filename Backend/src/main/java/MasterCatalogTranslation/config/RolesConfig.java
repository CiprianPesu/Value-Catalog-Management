package MasterCatalogTranslation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spring.security.oauth2.resourceserver.roles")
@Data
public class RolesConfig {
    private String guest;
    private String admin;
    private String translator;
    private String validator;
}

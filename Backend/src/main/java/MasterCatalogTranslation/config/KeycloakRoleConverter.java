package MasterCatalogTranslation.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;


/**
 * Converts a Keycloak-specific {@link Jwt} structure into a collection
 * of {@link GrantedAuthority} objects used by Spring Security.
 *
 * <p>This implementation extracts roles from the "realm_access.roles"
 * claim and prefixes them with "ROLE_" to comply with Spring Security
 * conventions.</p>
 */
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || !realmAccess.containsKey("roles")) {
            return Collections.emptyList();
        }

        Collection<String> realmRoles = (Collection<String>) realmAccess.get("roles");

        return realmRoles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }
}
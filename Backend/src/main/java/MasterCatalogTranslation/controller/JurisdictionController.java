package MasterCatalogTranslation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import MasterCatalogTranslation.model.dto.JurisdictionDto;
import MasterCatalogTranslation.service.JurisdictionService;
import audit.annotation.Audit;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/jurisdiction")
public class JurisdictionController {

    private final JurisdictionService jurisdictionService;

    public JurisdictionController(JurisdictionService jurisdictionService) {
        this.jurisdictionService = jurisdictionService;
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @Audit("GET JURISDICTIONS")
    @GetMapping()
    public ResponseEntity<List<JurisdictionDto>> getJurisdictions() {
        return ResponseEntity.ok(jurisdictionService.getAllJurisdictions());
    }
}

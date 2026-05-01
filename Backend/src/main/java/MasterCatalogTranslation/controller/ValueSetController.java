package MasterCatalogTranslation.controller;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import MasterCatalogTranslation.model.dto.stats.ValueSetStatsDto;
import MasterCatalogTranslation.service.ValueSetService;
import audit.annotation.Audit;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/valueSets")
public class ValueSetController {

    private final ValueSetService valueSetService;

    public ValueSetController(ValueSetService valueSetService) {
        this.valueSetService = valueSetService;
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @Audit("GET VALUE SETS BY MVC VERSION")
    @GetMapping("/mvcVersion/{version}")
    public ResponseEntity<List<ValueSetStatsDto>> getByMvcVersion(
            @PathVariable
            @NotNull
            @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "Versiunea trebuie să fie în formatul MAJOR.MINOR.PATCH, ex: 1.0.0")
            String version)
    {
        return ResponseEntity.ok(valueSetService.findAllByVersion(version));
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @Audit("GET VALUE SET BY ID")
    @GetMapping("/{id}")
    public ResponseEntity<ValueSetStatsDto> getById(@PathVariable @NotNull Long id) {
        return ResponseEntity.ok(valueSetService.findStatsById(id));
    }
}

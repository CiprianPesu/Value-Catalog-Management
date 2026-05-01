package MasterCatalogTranslation.controller;

import jakarta.validation.constraints.*;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import MasterCatalogTranslation.model.dto.ConceptResponseDto;
import MasterCatalogTranslation.service.ConceptService;
import audit.annotation.Audit;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/concepts")
public class ConceptController {

    private final ConceptService conceptService;

    public ConceptController(ConceptService conceptService) {
        this.conceptService = conceptService;
    }


    /**
     * Used to manually update and confirm the translation
     * @param id the id of the targeted concept
     * @param translation the new translation
     * @param jwt spring security Java Web Token
     */
    @PreAuthorize("hasRole(@rolesConfig.translator)")
    @Audit("MANUAL TRANSLATION")
    @PatchMapping("/{id}/translation")
    public ResponseEntity<Void> manualTranslation(
            @NotNull
            @PathVariable
            Long id,

            @NotNull
            @Size( max = 512, message = "Traducerea trebuie să aibă maxim 512 caractere")
            @RequestParam
            String translation,

            @AuthenticationPrincipal Jwt jwt
    ) {
        conceptService.updateTranslation(id, translation, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole(@rolesConfig.translator)")
    @Audit("CONFIRM AUTOMATIC TRANSLATION")
    @PostMapping("/translations/confirm")
    public ResponseEntity<Void> confirmAutomaticTranslation(
            @RequestBody @NotEmpty List<Long> conceptIds,
            @AuthenticationPrincipal Jwt jwt
    ) {
        conceptService.validateAutomaticTranslations(conceptIds, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole(@rolesConfig.validator)")
    @Audit("VALIDATE TRANSLATION")
    @PostMapping("/translations/validate")
    public ResponseEntity<Void> validateTranslations(
            @RequestBody @NotEmpty List<Long> conceptIds,
            @AuthenticationPrincipal Jwt jwt
    ) {
        conceptService.validateTranslations(conceptIds, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole(@rolesConfig.validator)")
    @Audit("INVALIDATE TRANSLATION")
    @PostMapping("/translations/invalidate")
    public ResponseEntity<String> invalidateTranslations(
            @RequestBody @NotEmpty List<Long> conceptIds,
            @AuthenticationPrincipal Jwt jwt
    ) {
        conceptService.invalidateTranslations(conceptIds, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @Audit("GET CONCEPTS")
    @GetMapping("/{valueSetId}/{status}")
    public  ResponseEntity<PagedModel<ConceptResponseDto>> getConcepts(
            @PathVariable @NotNull Long valueSetId,

            @PathVariable
            @Pattern(regexp="pending|translated|validated",
                     message = "Status trebuie sa fie in lista: [pending, translated, validated] ") String status,

            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) int size,

            @RequestParam(defaultValue = "code")
            @Pattern(regexp="code|description|descriptionAutomatedTranslation|translation",
                     message = "Sort trebuie sa fie in lista: [code, description, descriptionAutomatedTranslation, translation] ")
            String sort,

            @RequestParam(defaultValue = "asc")
            @Pattern(regexp="asc|desc", message = "Direction trebuie sa fie in lista: [asc, desc]")
            String direction
    ) {

        PagedModel<ConceptResponseDto> responseDtoPage = new PagedModel<>(conceptService.findConceptByValueSetAndStatus(status, direction, page, size, sort, valueSetId));

        return ResponseEntity.ok(responseDtoPage);
    }

}


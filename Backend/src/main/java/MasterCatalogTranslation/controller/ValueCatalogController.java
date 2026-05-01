package MasterCatalogTranslation.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import MasterCatalogTranslation.model.entity.Jurisdiction;
import MasterCatalogTranslation.model.entity.ValueCatalog;
import MasterCatalogTranslation.model.dto.ValueCatalogResponseDto;
import MasterCatalogTranslation.model.dto.stats.ValueCatalogVersionStatsDto;
import MasterCatalogTranslation.service.JurisdictionService;
import MasterCatalogTranslation.service.ValueCatalogService;
import audit.annotation.Audit;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Validated
@RestController
@RequestMapping("/api/valueCatalog")
public class ValueCatalogController {

    private final ValueCatalogService valueCatalogService;
    private final JurisdictionService jurisdictionService;

    public ValueCatalogController(ValueCatalogService valueCatalogService, JurisdictionService jurisdictionService) {
        this.valueCatalogService = valueCatalogService;
        this.jurisdictionService = jurisdictionService;
    }

    @Transactional
    @PreAuthorize("hasRole(@rolesConfig.admin)")
    @Audit("UPLOAD MVC FILE")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadExcel(
            @NotNull
            @RequestParam("file") MultipartFile file,

            @NotNull
            @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "Versiunea trebuie să fie în formatul MAJOR.MINOR.PATCH, ex: 1.0.0")
            @RequestParam("version") String version,

            @NotNull
            @RequestParam("jurisdictionId") Integer jurisdictionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        Optional<Jurisdiction> jurisdictionOptional = jurisdictionService.getById(jurisdictionId);

        if(jurisdictionOptional.isEmpty())
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Jurisdictia nu exist!");


        if(jurisdictionOptional.get().getName().equals("UE"))
            try {
                valueCatalogService.processMVCFile(file, version.toString(), jwt.getClaim("name"), jurisdictionOptional.get());
                return ResponseEntity.ok(
                        "Fișierul a fost încărcat cu succes."
                );

            } catch (Exception e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Eroare la procesarea fișierului.");
            }
        else{
            return ResponseEntity
                    .status(HttpStatus.NOT_IMPLEMENTED)
                    .body("Jurisdictia nu este implementata");
        }

    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @GetMapping()
    @Audit("GET ALL MVC FILES")
    public ResponseEntity<List<ValueCatalogResponseDto>> getAllFiles(
                                                                 @RequestParam(defaultValue = "uploadedAt")
                                                                 @Pattern(regexp="uploadedBy|uploadedAt|name|jurisdiction|version",
                                                                          message = "Sort trebuie sa fie in lista: [uploadedBy, uploadedAt, name, jurisdiction, version] ")
                                                                 String sort,

                                                                 @RequestParam(defaultValue = "asc")
                                                                 @Pattern(regexp="asc|desc", message = "Direction trebuie sa fie in lista: [asc, desc]")
                                                                 String direction) {

        return ResponseEntity.ok(valueCatalogService.findAllFiles(sort, direction));
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @GetMapping("/stats")
    @Audit("GET THE STATS FOR EVERY MVC VERSION")
    public ResponseEntity<List<ValueCatalogVersionStatsDto>> getMVCVersionStats() {
        return ResponseEntity.ok((valueCatalogService.getMvcVersionsStats()));
    }

    @PreAuthorize("hasRole(@rolesConfig.guest)")
    @GetMapping("/stats/{version}")
    @Audit("GET THE STATS FOR SPECIFIC MVC VERSION")
    public ResponseEntity<ValueCatalogVersionStatsDto> getMVCVersionStats(
            @PathVariable
            @NotNull
            @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "Versiunea trebuie să fie în formatul MAJOR.MINOR.PATCH, ex: 1.0.0")
            String version) {
        return ResponseEntity.ok((valueCatalogService.getMvcVersionStats(version)));
    }

    @PreAuthorize("hasRole(@rolesConfig.admin)")
    @Audit("DOWNLOAD ORIGINAL MVC FILE")
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable @NotNull Long id) {

        ValueCatalog file = valueCatalogService.findById(id)
                .orElseThrow(() -> new RuntimeException("Fișier inexistent"));

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=\"" + file.getName() + "\"")
                .header("Content-Type", file.getContentType()).body(file.getData());
    }

    @PreAuthorize("hasRole(@rolesConfig.admin)")
    @Audit("DOWNLOAD TRANSLATED MVC FILE")
    @GetMapping("/download/translated/{version}")
    public ResponseEntity<Resource> downloadTranslated(
            @PathVariable
            @NotNull
            @Pattern(regexp = "\\d+\\.\\d+\\.\\d+", message = "Versiunea trebuie să fie în formatul MAJOR.MINOR.PATCH, ex: 1.0.0")
            String version)
            throws  IOException {

        byte[] data = valueCatalogService.getMVCVersionTranslatedFile(version);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }

        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=mvc-" + version + "-translated.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(data.length)
                .body(resource);
    }

}

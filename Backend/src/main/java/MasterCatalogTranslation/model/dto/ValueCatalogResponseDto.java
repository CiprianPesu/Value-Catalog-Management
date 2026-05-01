package MasterCatalogTranslation.model.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ValueCatalogResponseDto(
        @NotNull
        Long id,

        @NotNull
        String name,

        @NotNull
        String version,

        @NotNull
        String jurisdiction,

        String uploadedBy,
        LocalDateTime uploadedAt,
        String contentType
) {}

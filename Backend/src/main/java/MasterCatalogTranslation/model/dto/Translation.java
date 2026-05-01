package MasterCatalogTranslation.model.dto;
import java.time.LocalDateTime;

public record Translation(
        String translation,
        LocalDateTime translatedAt,
        String translatedBy,
        LocalDateTime validatedAt,
        String validatedBy
) {}
package MasterCatalogTranslation.model.dto.stats;

public record ValueCatalogVersionStatsDto (
     String version,
     long totalConcepts,
     long translatedConcepts,
     long validatedConcepts
){}
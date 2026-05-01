package MasterCatalogTranslation.model.dto.stats;

public record ValueSetStatsDto (
        Long id,
     String valueSetId,
     String name,

     long totalConcepts,
     long totalTranslatedConcepts,
     long totalValidatedConcepts
){}

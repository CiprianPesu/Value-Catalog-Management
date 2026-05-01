package MasterCatalogTranslation.model.dto;
import MasterCatalogTranslation.model.entity.Concept;

public record ConceptResponseDto  (
     Long id,
     String code,
     String description,
     String descriptionAutomatedTranslation,
     Translation translation
){
    public static ConceptResponseDto fromEntity(Concept concept) {
        return new ConceptResponseDto(
                concept.getId(),
                concept.getCode(),
                concept.getDescription(),
                concept.getDescriptionAutomatedTranslation(),
                new Translation(
                        concept.getTranslation(),
                        concept.getTranslatedAt(),
                        concept.getTranslatedBy(),
                        concept.getValidatedAt(),
                        concept.getValidatedBy())
        );
    }
}

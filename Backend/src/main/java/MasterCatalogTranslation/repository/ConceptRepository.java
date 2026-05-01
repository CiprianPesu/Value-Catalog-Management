package MasterCatalogTranslation.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MasterCatalogTranslation.model.entity.CodeSystem;
import MasterCatalogTranslation.model.entity.Concept;
import MasterCatalogTranslation.model.entity.ValueSet;


import java.util.List;
import java.util.Optional;

@Repository
public interface ConceptRepository extends JpaRepository<Concept, Long> {

    // NOT translated AND NOT validated
    Page<Concept> findAllByValueSetIdAndTranslatedAtIsNullAndValidatedAtIsNull(
            Long valueSetId,
            Pageable pageable
    );

    // Translated AND NOT validated
    Page<Concept> findAllByValueSetIdAndTranslatedAtIsNotNullAndValidatedAtIsNull(
            Long valueSetId,
            Pageable pageable
    );

    // Translated AND validated
    Page<Concept> findAllByValueSetIdAndTranslatedAtIsNotNullAndValidatedAtIsNotNull(
            Long valueSetId,
            Pageable pageable
    );

    List<Concept> findAllByValueSet(ValueSet valueSet);

    Optional<Concept> findByCodeSystemAndCodeAndValueSet(CodeSystem codeSystem, String code, ValueSet valueSet);
}

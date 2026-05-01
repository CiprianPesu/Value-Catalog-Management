package MasterCatalogTranslation.service;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import MasterCatalogTranslation.model.dto.ConceptResponseDto;
import MasterCatalogTranslation.model.entity.CodeSystem;
import MasterCatalogTranslation.model.entity.Concept;
import MasterCatalogTranslation.model.entity.ValueSet;
import MasterCatalogTranslation.repository.CodeSystemRepository;
import MasterCatalogTranslation.repository.ConceptRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ConceptService {
    private final ConceptRepository conceptRepository;
    private final CodeSystemRepository codeSystemRepository;

    public ConceptService(ConceptRepository conceptRepository, CodeSystemRepository codeSystemRepository) {
        this.conceptRepository = conceptRepository;
        this.codeSystemRepository = codeSystemRepository;
    }

    public Optional<Concept> findById(Long id) {
        return conceptRepository.findById(id);
    }

    @Transactional
    public void validateAutomaticTranslations(List<Long> conceptIds, String translatedBy) {
        List<Concept> concepts = conceptRepository.findAllById(conceptIds);

        LocalDateTime now = LocalDateTime.now();

        concepts.forEach(concept -> {
            concept.setTranslation(concept.getDescriptionAutomatedTranslation());
            concept.setTranslatedAt(now);
            concept.setTranslatedBy(translatedBy);
        });

        conceptRepository.saveAll(concepts);
    }

    @Transactional
    public void updateTranslation(Long id, String translation, String translatedBy) {
        Optional<Concept> conceptOptional = conceptRepository.findById(id);

        if (conceptOptional.isPresent()) {
            Concept concept = conceptOptional.get();
            LocalDateTime now = LocalDateTime.now();
            concept.setTranslation(translation);
            concept.setTranslatedAt(now);
            concept.setTranslatedBy(translatedBy);
            conceptRepository.save(concept);
        }
    }

    @Transactional
    public void invalidateTranslations(List<Long> conceptIds, String invalidatedBy) {
        List<Concept> concepts = conceptRepository.findAllById(conceptIds);

        concepts.forEach(concept -> {
            concept.setTranslation(null);
            concept.setTranslatedBy(null);
            concept.setTranslatedAt(null);
            concept.setValidatedAt(null);
            concept.setValidatedBy(null);
        });

        conceptRepository.saveAll(concepts);
    }

    @Transactional
    public void validateTranslations(List<Long> conceptIds, String validatedBy) {
        List<Concept> concepts = conceptRepository.findAllById(conceptIds);

        LocalDateTime now = LocalDateTime.now();

        concepts.forEach(concept -> {
            concept.setValidatedAt(now);
            concept.setValidatedBy(validatedBy);
        });

        conceptRepository.saveAll(concepts);
    }


    @Transactional
    public Page<ConceptResponseDto> findConceptByValueSetAndStatus( String status, String direction, Integer page, Integer pageSize, String sort, Long valueSetId) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        PageRequest pageRequest = PageRequest.of(page, pageSize, Sort.by(sortDirection, sort));

        Page<Concept> conceptsPage = null;
        switch (status) {
            case "pending" ->   conceptsPage = getPendingByValueSet(valueSetId, pageRequest);
            case "translated" -> conceptsPage = getTranslatedByValueSet(valueSetId, pageRequest);
            case "validated" -> conceptsPage = getTranslatedAndValidatedByValueSet(valueSetId, pageRequest);
        }

        if(conceptsPage!=null){
            List<ConceptResponseDto> dtos = conceptsPage.stream()
                    .map(ConceptResponseDto::fromEntity)
                    .toList();

            return new PageImpl<>(dtos, pageRequest, conceptsPage.getTotalElements());
        }

        return Page.empty(pageRequest) ;
    }


    private Page<Concept> getPendingByValueSet(
            Long valueSetId,
            Pageable pageable
    ) {
        return conceptRepository
                .findAllByValueSetIdAndTranslatedAtIsNullAndValidatedAtIsNull(
                        valueSetId, pageable
                );
    }


    private Page<Concept> getTranslatedByValueSet(
            Long valueSetIds,
            Pageable pageable
    ) {
        return conceptRepository
                .findAllByValueSetIdAndTranslatedAtIsNotNullAndValidatedAtIsNull(
                        valueSetIds, pageable
                );
    }


    private Page<Concept> getTranslatedAndValidatedByValueSet(
            Long valueSetId,
            Pageable pageable
    ) {
        return conceptRepository
                .findAllByValueSetIdAndTranslatedAtIsNotNullAndValidatedAtIsNotNull(
                        valueSetId, pageable
                );
    }

    public Optional<Concept> findByCodeSystemAndCode(ValueSet valueSet, String codeSystemId, String codeSystemVersion, String conceptCode) {
        Optional<CodeSystem> codeSystem = codeSystemRepository.findByCodeSystemIdAndVersion(codeSystemId, codeSystemVersion).stream().findFirst();

        return codeSystem.flatMap(system -> conceptRepository.findByCodeSystemAndCodeAndValueSet(system, conceptCode, valueSet).stream().findFirst());
    }

    @Transactional(readOnly = true)
    public Map<String, Concept> loadConceptsForValueSet(ValueSet valueSet) {
        return conceptRepository.findAllByValueSet(valueSet)
                .stream()
                .filter(c -> c.getTranslation() != null)
                .collect(Collectors.toMap(
                        c -> c.getCodeSystem().getId() + "|" +
                                c.getCodeSystem().getVersion() + "|" +
                                c.getCode(),
                        Function.identity()
                ));
    }

    public void save(Concept concept) {
        conceptRepository.save(concept);
    }
}

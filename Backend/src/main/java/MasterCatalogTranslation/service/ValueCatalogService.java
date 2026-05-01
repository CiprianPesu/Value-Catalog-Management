package MasterCatalogTranslation.service;

import MasterCatalogTranslation.model.entity.*;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import MasterCatalogTranslation.model.dto.Translation;
import MasterCatalogTranslation.model.dto.ValueCatalogResponseDto;
import MasterCatalogTranslation.model.dto.stats.ValueCatalogVersionStatsDto;
import MasterCatalogTranslation.repository.ValueCatalogRepository;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ValueCatalogService {
    private static final Logger logger = LoggerFactory.getLogger(ValueCatalogService.class);
    private static final int LOG_PROGRESS_INTERVAL = 10_000;

    private final ValueCatalogRepository valueCatalogRepository;
    private final CodeSystemService codeSystemService;
    private final ConceptService conceptService;
    private final ValueSetService valueSetService;

    public ValueCatalogService(ValueCatalogRepository valueCatalogRepository, CodeSystemService codeSystemService, ConceptService conceptService, ValueSetService valueSetService) {
        this.valueCatalogRepository = valueCatalogRepository;
        this.codeSystemService = codeSystemService;
        this.conceptService = conceptService;
        this.valueSetService = valueSetService;
    }

    public ValueCatalog save(ValueCatalog valueCatalog) {
        return valueCatalogRepository.save(valueCatalog);
    }

    public Optional<ValueCatalog> findById(Long id) {
        return valueCatalogRepository.findById(id);
    }

    @Value("${xmlFileFormat.table-header-row}")
    private Integer HEADER_ROW;
    @Value("${xmlFileFormat.codeSystemIdCol}")
    private Integer CODE_SYSTEM_ID_COL;
    @Value("${xmlFileFormat.codeSystemVersionCol}")
    private Integer CODE_SYSTEM_VERSION_COL;
    @Value("${xmlFileFormat.conceptCodeCol}")
    private Integer CONCEPT_CODE_COL;
    @Value("${xmlFileFormat.descriptionCol}")
    private Integer DESCRIPTION_COL;
    @Value("${xmlFileFormat.descriptionTranslationCol}")
    private Integer DESCRIPTION_TRANSLATION_COL;
    @Value("${xmlFileFormat.translationColumnName}")
    private String TRANSLATION_COL_NAME;

    @Transactional
    public void processMVCFile(MultipartFile file, String version, String uploadedBy, Jurisdiction jurisdiction) throws IOException {

        Optional<ValueCatalog> sameVersionFile = valueCatalogRepository.findByVersion(version);

        Optional<ValueCatalog> translationSource =
                sameVersionFile.isPresent()
                        ? sameVersionFile
                        : findPreviousSmallerVersion(version);

        Map<String, Translation> oldTranslations = new HashMap<>();

        if (translationSource.isPresent()) {
            logger.info(
                    "Reusing human translations from MVC version {}",
                    translationSource.get().getVersion()
            );
            oldTranslations = loadTranslations(translationSource.get());
        }

        Workbook workbook = WorkbookFactory.create(file.getInputStream());

        ValueCatalog valueCatalog = new ValueCatalog();
        valueCatalog.setName(file.getOriginalFilename());
        valueCatalog.setUploadedAt(LocalDateTime.now());
        valueCatalog.setUploadedBy(uploadedBy);
        valueCatalog.setVersion(version);
        valueCatalog.setContentType(file.getContentType());
        valueCatalog.setData(file.getBytes());
        valueCatalog.setJurisdiction(jurisdiction);

        ValueCatalog savedFile = save(valueCatalog);

        List<Sheet> validSheets = new ArrayList<>();
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            Sheet sheet = workbook.getSheetAt(i);
            if ("Value Set ID".equals(sheet.getRow(0).getCell(0).getStringCellValue())) {
                validSheets.add(sheet);
            }
        }
        processSheets(validSheets, savedFile, oldTranslations);
        sameVersionFile.ifPresent(this::deleteMvcFileData);
    }

    private void processSheets(
            List<Sheet> sheets,
            ValueCatalog savedFile,
            Map<String, Translation> oldTranslations
    ) {
        DataFormatter formatter = new DataFormatter();

        int totalValueSets = 0;
        int totalCodeSystems = 0;
        int totalConcepts = 0;

        for (Sheet sheet : sheets) {
            // ValueSet
            ValueSet valueSet = new ValueSet();
            valueSet.setValueSetId(formatter.formatCellValue(sheet.getRow(0).getCell(1)));
            valueSet.setName(formatter.formatCellValue(sheet.getRow(1).getCell(1)));
            valueSet.setUrl(formatter.formatCellValue(sheet.getRow(2).getCell(1)));
            valueSet.setVersionId(formatter.formatCellValue(sheet.getRow(4).getCell(1)));
            valueSet.setValueCatalog(savedFile);
            valueSet = valueSetService.save(valueSet);
            totalValueSets++;

            int conceptsInSheet = 0;

            Map<String, CodeSystem> codeSystemCache = new HashMap<>();

            for (int i = HEADER_ROW + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String codeSystemId = formatter.formatCellValue(row.getCell(CODE_SYSTEM_ID_COL));
                String codeSystemVersion = formatter.formatCellValue(row.getCell(CODE_SYSTEM_VERSION_COL));

                String key = codeSystemId + "|" + codeSystemVersion;


                CodeSystem codeSystem = codeSystemCache.get(key);
                if (codeSystem == null) {
                    codeSystem = codeSystemService.findByCodeSystemIdAndVersion(codeSystemId, codeSystemVersion)
                            .orElseGet(() -> {
                                CodeSystem cs = new CodeSystem();
                                cs.setCodeSystemId(codeSystemId);
                                cs.setVersion(codeSystemVersion);
                                return codeSystemService.save(cs);
                            });

                    codeSystemCache.put(key, codeSystem);
                    totalCodeSystems++;
                }
                String conceptCode = formatter.formatCellValue(row.getCell(CONCEPT_CODE_COL));
                if (conceptCode.isBlank()) continue;


                Concept concept = new Concept();
                concept.setCode(conceptCode);
                concept.setDescription(formatter.formatCellValue(row.getCell(DESCRIPTION_COL)));
                concept.setDescriptionAutomatedTranslation(formatter.formatCellValue(row.getCell(DESCRIPTION_TRANSLATION_COL)));
                concept.setValueSet(valueSet);
                concept.setCodeSystem(codeSystem);


                String oldKey = codeSystemId + "|" +
                        codeSystemVersion + "|" +
                        conceptCode;

                Translation snapshot = oldTranslations.get(oldKey);

                if (snapshot != null) {
                    concept.setTranslation(snapshot.translation());
                    concept.setTranslatedAt(snapshot.translatedAt());
                    concept.setTranslatedBy(snapshot.translatedBy());
                    concept.setValidatedAt(snapshot.validatedAt());
                    concept.setValidatedBy(snapshot.validatedBy());
                }

                conceptService.save(concept);

                conceptsInSheet++;
                totalConcepts++;


                if (conceptsInSheet % LOG_PROGRESS_INTERVAL == 0) {
                    logger.info("Sheet '{}' - Processed {} concepts so far...", valueSet.getName(), conceptsInSheet);
                }
            }

            logger.info("Finished sheet '{}': inserted {} concepts. ValueSets total: {}, CodeSystems total: {}, Concepts total: {}",
                    valueSet.getName(), conceptsInSheet, totalValueSets, totalCodeSystems, totalConcepts);
        }

        logger.info("All sheets processed. Summary: ValueSets={}, CodeSystems={}, Concepts={}",
                totalValueSets, totalCodeSystems, totalConcepts);
    }

    private Map<String, Translation> loadTranslations(ValueCatalog oldFile) {
        Map<String, Translation> map = new HashMap<>();

        for (ValueSet vs : oldFile.getValueSets()) {
            for (Concept c : vs.getConcepts()) {
                if (c.getTranslation() == null) continue;

                String key = c.getCodeSystem().getId() + "|" +
                        c.getCodeSystem().getVersion() + "|" +
                        c.getCode();

                map.put(key, new Translation(
                        c.getTranslation(),
                        c.getTranslatedAt(),
                        c.getTranslatedBy(),
                        c.getValidatedAt(),
                        c.getValidatedBy()
                ));
            }
        }
        return map;
    }

    @Transactional(readOnly = true)
    public byte[] getMVCVersionTranslatedFile(String version) throws IOException {

        ValueCatalog valueCatalog = valueCatalogRepository.findByVersion(version)
                .orElse(null);
        if (valueCatalog == null) {
            return null;
        }

        Workbook workbook = WorkbookFactory.create(
                new ByteArrayInputStream(valueCatalog.getData())
        );

        DataFormatter formatter = new DataFormatter();

        for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
            Sheet sheet = workbook.getSheetAt(s);

            // Validate MVC sheet
            if (!"Value Set ID".equals(
                    formatter.formatCellValue(sheet.getRow(0).getCell(0))
            )) {
                continue;
            }

            // Resolve ValueSet
            String valueSetName =
                    formatter.formatCellValue(sheet.getRow(1).getCell(1));
            String valueSetVersionId =
                    formatter.formatCellValue(sheet.getRow(4).getCell(1));

            ValueSet valueSet = valueSetService
                    .findAllByValueCatalogAndNameAndVersionId(
                            valueCatalog,
                            valueSetName,
                            valueSetVersionId
                    )
                    .orElse(null);

            if (valueSet == null) continue;

            Map<String, Concept> conceptMap =
                    conceptService.loadConceptsForValueSet(valueSet);

            if (conceptMap.isEmpty()) continue;

            Row headerRow = sheet.getRow(HEADER_ROW);
            int roColIndex = findOrCreateRoColumn(headerRow);

            // Fill rows
            for (int i = HEADER_ROW + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String conceptCode =
                        formatter.formatCellValue(row.getCell(CONCEPT_CODE_COL));
                if (conceptCode.isBlank()) continue;

                String codeSystemId =
                        formatter.formatCellValue(row.getCell(CODE_SYSTEM_ID_COL));
                String codeSystemVersion =
                        formatter.formatCellValue(row.getCell(CODE_SYSTEM_VERSION_COL));

                String key = codeSystemId + "|" +
                        codeSystemVersion + "|" +
                        conceptCode;

                Concept concept = conceptMap.get(key);
                if (concept == null || concept.getTranslation() == null) continue;

                Cell roCell = row.getCell(roColIndex);
                if (roCell == null) {
                    roCell = row.createCell(roColIndex);
                }
                roCell.setCellValue(concept.getTranslation());
            }
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            workbook.close();
            return out.toByteArray();
        }
    }

    private int findOrCreateRoColumn(Row headerRow) {
        for (Cell cell : headerRow) {
            if (TRANSLATION_COL_NAME.equals(cell.getStringCellValue())) {
                return cell.getColumnIndex();
            }
        }

        int index = headerRow.getLastCellNum();
        if (index < 0) {
            index = headerRow.getPhysicalNumberOfCells();
        }

        headerRow.createCell(index).setCellValue(TRANSLATION_COL_NAME);
        return index;
    }

    @Transactional
    public void deleteMvcFileData(ValueCatalog oldFile) {
        valueSetService.deleteByMvcFile(oldFile);
        valueCatalogRepository.delete(oldFile);
    }

    public List<ValueCatalogResponseDto> findAllFiles(String orderBy, String direction) {

        if (orderBy == null || orderBy.isBlank()) {
            orderBy = "uploadedAt";
        }

        List<String> allowedFields = List.of(
                "name",
                "version",
                "uploadedBy",
                "uploadedAt"
        );

        if (!allowedFields.contains(orderBy)) {
            orderBy = "uploadedAt";
        }

        // Direction
        Sort.Direction sortDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Sort sort = Sort.by(sortDirection, orderBy);

        return valueCatalogRepository.findAll(sort)
                .stream()
                .map(file -> new ValueCatalogResponseDto(
                        file.getId(),
                        file.getName(),
                        file.getVersion(),
                        file.getJurisdiction().getName(),
                        file.getUploadedBy(),
                        file.getUploadedAt(),
                        file.getContentType()
                ))
                .toList();
    }

    public List<ValueCatalogVersionStatsDto> getMvcVersionsStats() {
        return valueCatalogRepository.getMvcVersionsStatsRaw();
    }

    public ValueCatalogVersionStatsDto getMvcVersionStats(String versionId) {
        return valueCatalogRepository.getMvcVersionStatsRaw(versionId);
    }

    private Optional<ValueCatalog> findPreviousSmallerVersion(String version) {
        return valueCatalogRepository
                .findPreviousVersions(version, PageRequest.of(0, 1))
                .stream()
                .findFirst();
    }
}


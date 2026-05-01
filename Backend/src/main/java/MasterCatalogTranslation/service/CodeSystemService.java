package MasterCatalogTranslation.service;

import org.springframework.stereotype.Service;
import MasterCatalogTranslation.model.entity.CodeSystem;
import MasterCatalogTranslation.repository.CodeSystemRepository;

import java.util.Optional;

@Service
public class CodeSystemService {
    private final CodeSystemRepository codeSystemRepository;

    public CodeSystemService(CodeSystemRepository codeSystemRepository) {
        this.codeSystemRepository = codeSystemRepository;
    }

    public CodeSystem save(CodeSystem codeSystem) {
        return codeSystemRepository.save(codeSystem);
    }

    public Optional<CodeSystem> findByCodeSystemIdAndVersion(String id, String version) {
        return codeSystemRepository.findByCodeSystemIdAndVersion(id, version);
    }
}
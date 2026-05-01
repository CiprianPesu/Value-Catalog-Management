package MasterCatalogTranslation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import MasterCatalogTranslation.model.entity.ValueCatalog;
import MasterCatalogTranslation.model.entity.ValueSet;
import MasterCatalogTranslation.model.dto.stats.ValueSetStatsDto;
import MasterCatalogTranslation.repository.ValueSetRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ValueSetService {
    private final ValueSetRepository valueSetRepository;

    public ValueSetService(ValueSetRepository valueSetRepository) {
        this.valueSetRepository = valueSetRepository;
    }

    public ValueSet save(ValueSet valueSet) {
        return valueSetRepository.save(valueSet);
    }

    public Optional<ValueSet> findById(Long id) {
        return valueSetRepository.findById(id);
    }

    public List<ValueSetStatsDto> findAllByVersion(String mvcvVersion) {
        return valueSetRepository.findValueSetStatsByMvcVersion(mvcvVersion);
    }

    public ValueSetStatsDto findStatsById(Long id) {
        return valueSetRepository.findValueSetStats(id);
    }

    @Transactional
    public void deleteByMvcFile(ValueCatalog valueCatalog) {
        valueSetRepository.deleteByValueCatalog(valueCatalog);
    }


    public Optional<ValueSet> findAllByValueCatalogAndNameAndVersionId(ValueCatalog valueCatalog, String name, String versionId) {
        return valueSetRepository.findAllByValueCatalogAndNameAndVersionId(valueCatalog, name, versionId).stream().findFirst();
    }
}



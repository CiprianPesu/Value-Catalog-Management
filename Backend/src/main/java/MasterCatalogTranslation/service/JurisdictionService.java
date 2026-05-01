package MasterCatalogTranslation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import MasterCatalogTranslation.model.dto.JurisdictionDto;
import MasterCatalogTranslation.model.entity.Jurisdiction;
import MasterCatalogTranslation.repository.JurisdictionRepository;

import java.util.List;
import java.util.Optional;

@Service
public class JurisdictionService {

    private final JurisdictionRepository jurisdictionRepository;

    public JurisdictionService(JurisdictionRepository jurisdictionRepository) {
        this.jurisdictionRepository = jurisdictionRepository;
    }

    @Transactional
    public List<JurisdictionDto> getAllJurisdictions() {
        return jurisdictionRepository.findAll().stream().map(j -> new JurisdictionDto(j.getId(), j.getName())).toList();
    }

    public Optional<Jurisdiction> getById(int id){
        return jurisdictionRepository.findById((long) id);
    }
}

package MasterCatalogTranslation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MasterCatalogTranslation.model.entity.CodeSystem;

import java.util.Optional;

@Repository
public interface CodeSystemRepository extends JpaRepository<CodeSystem, Long> {
    Optional<CodeSystem> findByCodeSystemIdAndVersion(String id, String version);

}

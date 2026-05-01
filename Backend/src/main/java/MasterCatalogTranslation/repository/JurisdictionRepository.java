package MasterCatalogTranslation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MasterCatalogTranslation.model.entity.Jurisdiction;

@Repository
public interface JurisdictionRepository extends JpaRepository<Jurisdiction, Long> {

}

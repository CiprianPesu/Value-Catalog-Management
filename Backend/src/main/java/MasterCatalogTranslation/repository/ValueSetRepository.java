package MasterCatalogTranslation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import MasterCatalogTranslation.model.entity.ValueCatalog;
import MasterCatalogTranslation.model.entity.ValueSet;
import MasterCatalogTranslation.model.dto.stats.ValueSetStatsDto;
import java.util.List;

@Repository
public interface ValueSetRepository extends JpaRepository<ValueSet, Long> {
    @Query("""
                select new MasterCatalogTranslation.model.dto.stats.ValueSetStatsDto(
                    vs.id,
                    vs.valueSetId,
                    vs.name,
                    count(c),
                    sum(case when c.translatedAt is not null then 1 else 0 end),
                    sum(case when c.validatedAt is not null then 1 else 0 end)
                )
                from ValueSet vs
                left join Concept c on c.valueSet = vs
                join vs.valueCatalog vc
                where vc.version = :mvcVersion
                group by vs.id, vs.id, vs.name
            """)
    List<ValueSetStatsDto> findValueSetStatsByMvcVersion(@Param("mvcVersion") String mvcVersion);

    @Query("""
                select new MasterCatalogTranslation.model.dto.stats.ValueSetStatsDto(
                    vs.id,
                    vs.valueSetId,
                    vs.name,
                    count(c),
                    sum(case when c.translatedAt is not null then 1 else 0 end),
                    sum(case when c.validatedAt is not null then 1 else 0 end)
                )
                from ValueSet vs
                left join Concept c on c.valueSet = vs
                where  vs.id = :id
                group by vs.id, vs.id, vs.name
            """)
    ValueSetStatsDto findValueSetStats(@Param("id") Long id);

    void deleteByValueCatalog(ValueCatalog valueCatalog);

    List<ValueSet> findAllByValueCatalogAndNameAndVersionId(ValueCatalog valueCatalog, String name, String versionId);
}

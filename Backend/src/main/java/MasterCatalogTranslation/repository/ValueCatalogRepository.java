package MasterCatalogTranslation.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import MasterCatalogTranslation.model.entity.ValueCatalog;
import MasterCatalogTranslation.model.dto.stats.ValueCatalogVersionStatsDto;

import java.util.List;
import java.util.Optional;

@Repository
public interface ValueCatalogRepository extends JpaRepository<ValueCatalog, Long> {

    @Query("""
        select new MasterCatalogTranslation.model.dto.stats.ValueCatalogVersionStatsDto(
            vc.version,
            count(c),
            sum(case when c.translatedAt is not null then 1 else 0 end),
            sum(case when c.validatedAt is not null then 1 else 0 end)
        )
        from ValueCatalog vc
        join vc.valueSets vs
        left join vs.concepts c
        group by vc.version
    """)
    List<ValueCatalogVersionStatsDto> getMvcVersionsStatsRaw();

    @Query("""
        select new MasterCatalogTranslation.model.dto.stats.ValueCatalogVersionStatsDto(
            :version,
            count(c),
            sum(case when c.translatedAt is not null then 1 else 0 end),
            sum(case when c.validatedAt is not null then 1 else 0 end)
        )
        from ValueCatalog vc
        join vc.valueSets vs
        left join vs.concepts c
        where vc.version = :version
    """)
    ValueCatalogVersionStatsDto getMvcVersionStatsRaw(String version);

    @Query("""
        select vc
        from ValueCatalog vc
        where vc.version < :version
        order by vc.version desc
    """)
    List<ValueCatalog> findPreviousVersions(String version, Pageable pageable);

    Optional<ValueCatalog> findByVersion(String version);
}
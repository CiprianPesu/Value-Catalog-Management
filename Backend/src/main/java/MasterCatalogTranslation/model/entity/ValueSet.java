package MasterCatalogTranslation.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ValueSet")
public class ValueSet {
    @Id
    @GeneratedValue
    private Long id;

    @Column(columnDefinition = "text")
    private String name;
    private String versionId;
    @Column(columnDefinition = "text")
    private String url;

    private String valueSetId;

    @ManyToOne
    @JoinColumn(name = "value_catalog_id")
    private ValueCatalog valueCatalog;

    @OneToMany(mappedBy = "valueSet", cascade = CascadeType.ALL)
    private List<Concept> concepts = new ArrayList<>();
}


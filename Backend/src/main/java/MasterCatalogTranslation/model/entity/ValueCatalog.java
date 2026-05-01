package MasterCatalogTranslation.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ValueCatalog")
public class ValueCatalog {
    @Id
    @GeneratedValue
    private Long id;

    @Column(columnDefinition = "text")
    private String name;
    private LocalDateTime uploadedAt;
    private String uploadedBy;
    private String contentType;
    private String version;

    @Lob
    private byte[] data;

    @OneToMany(mappedBy = "valueCatalog", cascade = CascadeType.ALL)
    private List<ValueSet> valueSets = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "jurisdiction_id")
    private Jurisdiction jurisdiction;
}
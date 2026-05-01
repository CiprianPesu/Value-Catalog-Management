package MasterCatalogTranslation.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "CodeSystem")
public class CodeSystem {
    @Id
    @GeneratedValue
    private Long id;

    private String codeSystemId;
    private String version;

    @OneToMany(mappedBy = "codeSystem")
    private List<Concept> concepts = new ArrayList<>();
}

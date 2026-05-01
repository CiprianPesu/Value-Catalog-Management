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
@Table(name = "Jurisdiction")
public class Jurisdiction {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @OneToMany(mappedBy = "jurisdiction", cascade = CascadeType.ALL)
    private List<ValueCatalog> valueCatalogs = new ArrayList<>();
}

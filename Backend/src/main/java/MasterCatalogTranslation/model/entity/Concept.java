package MasterCatalogTranslation.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Concept")
public class Concept {
    @Id
    @GeneratedValue
    private Long id;
    private String code;
    @Column(columnDefinition = "text")
    private String description;
    @Column(columnDefinition = "text")
    private String descriptionAutomatedTranslation;
    @Column(columnDefinition = "text")
    private String translation;
    private LocalDateTime translatedAt;
    private String translatedBy;
    private LocalDateTime validatedAt;
    private String validatedBy;

    @ManyToOne
    @JoinColumn(name = "value_set_id")
    private ValueSet valueSet;

    @ManyToOne
    @JoinColumn(name = "code_system_id")
    private CodeSystem codeSystem;
}

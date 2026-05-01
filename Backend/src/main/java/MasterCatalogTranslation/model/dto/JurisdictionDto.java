package MasterCatalogTranslation.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JurisdictionDto(
        @NotNull
        Long id,

        @NotNull
        @Size( max = 512, message = "Jurisdictia trebuie să aibă maxim 512 caractere")
        String name) {}

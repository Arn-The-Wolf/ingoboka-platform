package rw.ingoboka.shared.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import rw.ingoboka.shared.storage.DocumentStorageService;
import rw.ingoboka.shared.storage.LocalDocumentStorageService;

@Configuration
public class StorageConfig {

    @Bean
    @ConditionalOnProperty(name = "app.storage.provider", havingValue = "local")
    DocumentStorageService localDocumentStorageService(AppProperties appProperties) {
        return new LocalDocumentStorageService(appProperties);
    }
}

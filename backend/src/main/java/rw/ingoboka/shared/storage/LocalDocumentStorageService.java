package rw.ingoboka.shared.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import rw.ingoboka.shared.config.AppProperties;
import rw.ingoboka.shared.exception.BadRequestException;

@RequiredArgsConstructor
public class LocalDocumentStorageService implements DocumentStorageService {

    private final AppProperties appProperties;

    @Override
    public StoredDocument store(String category, String fileName, InputStream content, long size, String contentType) {
        try {
            Path base = Path.of(appProperties.getStorage().getLocal().getBasePath(), category);
            Files.createDirectories(base);
            String key = UUID.randomUUID() + "-" + sanitize(fileName);
            Path target = base.resolve(key);
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
            return new StoredDocument(category + "/" + key, fileName, size, contentType);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store document: " + e.getMessage());
        }
    }

    private String sanitize(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

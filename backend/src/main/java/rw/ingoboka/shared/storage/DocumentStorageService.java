package rw.ingoboka.shared.storage;

import java.io.InputStream;

public interface DocumentStorageService {

    StoredDocument store(String category, String fileName, InputStream content, long size, String contentType);

    record StoredDocument(String storageKey, String fileName, long size, String contentType) {
    }
}

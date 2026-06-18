package rw.ingoboka.shared.storage;

import java.io.InputStream;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import rw.ingoboka.shared.config.AppProperties;
import rw.ingoboka.shared.exception.BadRequestException;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class S3DocumentStorageService implements DocumentStorageService {

    private final AppProperties appProperties;

    @Override
    public StoredDocument store(String category, String fileName, InputStream content, long size, String contentType) {
        AppProperties.Storage.S3 s3 = appProperties.getStorage().getS3();
        String key = category + "/" + UUID.randomUUID() + "-" + sanitize(fileName);

        S3Client client = buildClient(s3);
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(s3.getBucket())
                    .key(key)
                    .contentType(contentType)
                    .contentLength(size)
                    .build();
            client.putObject(request, RequestBody.fromInputStream(content, size));
            return new StoredDocument(key, fileName, size, contentType);
        } catch (Exception e) {
            throw new BadRequestException("Failed to store document: " + e.getMessage());
        } finally {
            client.close();
        }
    }

    private S3Client buildClient(AppProperties.Storage.S3 s3) {
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(s3.isPathStyleAccess())
                .build();

        var builder = S3Client.builder()
                .region(Region.of(s3.getRegion() != null ? s3.getRegion() : "us-east-1"))
                .serviceConfiguration(s3Config);

        if (s3.getEndpoint() != null && !s3.getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(s3.getEndpoint()));
        }
        if (s3.getAccessKey() != null && !s3.getAccessKey().isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())));
        }
        return builder.build();
    }

    private String sanitize(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

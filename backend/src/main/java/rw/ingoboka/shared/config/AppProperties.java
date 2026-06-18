package rw.ingoboka.shared.config;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Otp otp = new Otp();
    private final Storage storage = new Storage();
    private final Security security = new Security();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs = 900_000L;
        private long refreshTokenExpirationMs = 604_800_000L;
        private String issuer = "ingoboka";

        public long getAccessTokenExpiryMs() {
            return accessTokenExpirationMs;
        }

        public long getRefreshTokenExpiryMs() {
            return refreshTokenExpirationMs;
        }
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = List.of("*");
        private List<String> exposedHeaders = List.of("Authorization", "X-Correlation-Id");
        private boolean allowCredentials = true;
        private long maxAge = 3600L;
    }

    @Getter
    @Setter
    public static class Otp {
        private int length = 6;
        private int expirationSeconds = 300;
        private int maxAttempts = 5;
        private String redisKeyPrefix = "otp:";

        public int getExpiryMinutes() {
            return Math.max(1, expirationSeconds / 60);
        }
    }

    @Getter
    @Setter
    public static class Storage {
        private String provider = "s3";
        private final S3 s3 = new S3();
        private final Local local = new Local();

        @Getter
        @Setter
        public static class S3 {
            private String bucket;
            private String region;
            private String endpoint;
            private String accessKey;
            private String secretKey;
            private boolean pathStyleAccess;
        }

        @Getter
        @Setter
        public static class Local {
            private String basePath = "./storage";
        }
    }

    @Getter
    @Setter
    public static class Security {
        private List<String> publicRoutes = List.of(
                "/api/v1/auth/**",
                "/api/v1/products",
                "/api/v1/products/**",
                "/api/v1/public/**",
                "/api/v1/payments/sandbox/callback",
                "/actuator/health",
                "/actuator/info",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html"
        );
    }
}

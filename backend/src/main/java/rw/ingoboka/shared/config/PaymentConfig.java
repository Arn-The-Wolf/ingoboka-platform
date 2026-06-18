package rw.ingoboka.shared.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import rw.ingoboka.payment.domain.PaymentPort;
import rw.ingoboka.payment.infrastructure.adapter.SandboxPaymentAdapter;

@Configuration
public class PaymentConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.payment.provider", havingValue = "sandbox", matchIfMissing = true)
    PaymentPort sandboxPaymentPort() {
        return new SandboxPaymentAdapter();
    }
}

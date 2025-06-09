package com.example.ImproveComsumption.payment.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class PaymentAuthInterceptor implements RequestInterceptor {

    @Value("${payment.secret-key}")
    private String secretKey;

    @Override
    public void apply(RequestTemplate template) {
        String encodedKey = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        template.header("Authorization", "Basic " + encodedKey);
        template.header("Content-Type", "application/json");
    }
}

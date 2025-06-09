package com.example.ImproveComsumption.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "tossClient", url = "${payment.base-url}", configuration = com.example.ImproveComsumption.payment.config.PaymentAuthInterceptor.class)
public interface TossClient {

    @PostMapping("/payments/confirm")
    Map<String, Object> confirmPayment(@RequestBody Map<String, Object> request);
}

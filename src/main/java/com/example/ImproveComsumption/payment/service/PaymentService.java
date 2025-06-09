package com.example.ImproveComsumption.payment.service;

import com.example.ImproveComsumption.payment.client.TossClient;
import com.example.ImproveComsumption.payment.entity.PaymentOrder;
import com.example.ImproveComsumption.payment.repository.PaymentOrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final TossClient tossClient;

    public PaymentService(PaymentOrderRepository paymentOrderRepository, TossClient tossClient) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.tossClient = tossClient;
    }

    // 결제 준비 (사전저장)
    public Map<String, Object> preparePayment(int amount, String email, String orderName) {
        String orderId = UUID.randomUUID().toString();

        PaymentOrder paymentOrder = PaymentOrder.builder()
                .orderId(orderId)
                .amount(amount)
                .memberEmail(email)
                .paid(false)
                .createdAt(LocalDateTime.now())
                .build();

        paymentOrderRepository.save(paymentOrder);

        return Map.of(
                "orderId", orderId,
                "amount", amount,
                "orderName", orderName
        );
    }

    // 결제 확인 (Toss 서버와 최종 검증)
    public void confirmPayment(String paymentKey, String orderId, int amount) {
        PaymentOrder paymentOrder = paymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("사전 등록된 결제 내역 없음"));

        if (paymentOrder.getAmount() != amount) {
            throw new IllegalArgumentException("결제 금액 불일치");
        }

        Map<String, Object> request = Map.of(
                "paymentKey", paymentKey,
                "orderId", orderId,
                "amount", amount
        );

        try {
            Map<String, Object> response = tossClient.confirmPayment(request);

            if (!"DONE".equals(response.get("status"))) {
                throw new IllegalStateException("결제 승인 실패 (status: " + response.get("status") + ")");
            }

            paymentOrder.setPaid(true);
            paymentOrderRepository.save(paymentOrder);

        } catch (FeignException e) {
            int status = e.status();
            String content = e.contentUTF8();

            String errorCode = parseErrorCode(content);
            handleTossError(errorCode, content);
        }
    }

    private String parseErrorCode(String content) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> errorMap = objectMapper.readValue(content, Map.class);
            return (String) errorMap.get("code");
        } catch (Exception e) {
            return "UNKNOWN_ERROR";
        }
    }

    private void handleTossError(String errorCode, String content) {
        switch (errorCode) {
            case "NOT_FOUND_PAYMENT_SESSION":
                throw new IllegalStateException("결제 세션 만료 (10분 초과): 재결제 필요");
            case "REJECT_CARD_COMPANY":
                throw new IllegalStateException("카드사 승인 거절: 한도 초과 혹은 카드 오류");
            case "FORBIDDEN_REQUEST":
                throw new IllegalStateException("API 키 또는 주문번호 불일치 (FORBIDDEN_REQUEST)");
            case "UNAUTHORIZED_KEY":
                throw new IllegalStateException("시크릿키 인증 실패 (UNAUTHORIZED_KEY)");
            default:
                throw new IllegalStateException("Toss 결제 승인 실패 (code=" + errorCode + "): " + content);
        }
    }
}

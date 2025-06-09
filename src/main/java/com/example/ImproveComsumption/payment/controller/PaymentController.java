package com.example.ImproveComsumption.payment.controller;

import com.example.ImproveComsumption.config.JwtUtil;
import com.example.ImproveComsumption.payment.dto.PrepareRequestDto;
import com.example.ImproveComsumption.payment.service.PaymentService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    public PaymentController(PaymentService paymentService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/prepare")
    public ResponseEntity<Map<String, Object>> prepare(
            @RequestHeader("Authorization") String token,
            @RequestBody PrepareRequestDto request
    ) {
        String email = extractEmailFromToken(token);  // ✅ 이제 진짜 JWT 파싱!
        Map<String, Object> response = paymentService.preparePayment(request.getAmount(), email, request.getOrderName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirm(@RequestBody Map<String, Object> request) {
        String paymentKey = (String) request.get("paymentKey");
        String orderId = (String) request.get("orderId");
        int amount = (int) request.get("amount");

        paymentService.confirmPayment(paymentKey, orderId, amount);
        return ResponseEntity.ok().build();
    }

    private String extractEmailFromToken(String token) {
        token = token.replace("Bearer ", "");
        Claims claims = jwtUtil.parseToken(token);
        return claims.getSubject();  // sub 클레임 = email
    }
}

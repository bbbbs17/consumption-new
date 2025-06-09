package com.example.ImproveComsumption.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@CrossOrigin(origins = "*") // 프론트에서 요청 허용
@RestController
@RequestMapping("/api/kakao")
@RequiredArgsConstructor
public class KakaoProxyController {

    @Value("${kakao.rest-api-key}")
    private String apiKey;

    @GetMapping("/search")
    public String search(@RequestParam("query") String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + apiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();

            // 🔹 주소 검색
            String addressUrl = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encoded;
            ResponseEntity<String> addressRes = restTemplate.exchange(new URI(addressUrl), HttpMethod.GET, entity, String.class);

            // 🔹 키워드 검색
            String keywordUrl = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encoded;
            ResponseEntity<String> keywordRes = restTemplate.exchange(new URI(keywordUrl), HttpMethod.GET, entity, String.class);

            // 🔹 두 결과 통합 반환
            return "{ \"addressResult\": " + addressRes.getBody() + ", \"keywordResult\": " + keywordRes.getBody() + " }";

        } catch (Exception e) {
            return "{\"error\": \"주소 검색 실패: " + e.getMessage() + "\"}";
        }
    }
}
package com.example.ImproveComsumption.service.config;

import com.example.ImproveComsumption.config.JwtUtil;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final MemberRepository memberRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // ✅ DB에서 사용자 조회
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // ✅ JWT 생성 (email & role 포함)
        String token = jwtUtil.generateToken(member.getEmail());

        // ✅ 프론트엔드로 리디렉션 (절대경로)
        response.sendRedirect("http://localhost:3000/success?token=" + token);
    }
}

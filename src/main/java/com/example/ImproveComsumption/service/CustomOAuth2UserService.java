package com.example.ImproveComsumption.service;

import com.example.ImproveComsumption.config.JwtUtil;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.domain.OAuthType;
import com.example.ImproveComsumption.domain.Role;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // ✅ 추가

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder; // ✅ 추가

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = (String) attributes.get("sub");

        Member member = memberRepository.findByEmail(email).orElse(null);

        if (member == null) {
            // 신규 사용자 등록
            member = new Member();
            member.setEmail(email);
            member.setName(name);

            // ✅ 랜덤 비번 생성 후 암호화해서 저장
            String randomPassword = UUID.randomUUID().toString();
            member.setPassword(passwordEncoder.encode(randomPassword));

            member.setOAuthType(OAuthType.GOOGLE);
            member.setProvider("google");
            member.setProviderId(providerId);
            member.setRole(Role.USER); // ✅ 역할도 설정

            memberRepository.save(member);
        } else if (member.getOAuthType() == OAuthType.NONE) {
            throw new RuntimeException("이미 존재하는 이메일입니다. 일반 로그인을 사용하세요!");
        }

        // JWT 발급
        String jwtToken = jwtUtil.generateToken(member.getEmail());
        System.out.println("JWT 생성: " + jwtToken);

        Map<String, Object> newAttributes = new HashMap<>(attributes);
        newAttributes.put("jwtToken", jwtToken);

        return new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority("USER")),
                newAttributes,
                "email"
        );
    }
}

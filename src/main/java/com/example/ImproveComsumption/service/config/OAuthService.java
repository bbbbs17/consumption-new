package com.example.ImproveComsumption.service.config;


import com.example.ImproveComsumption.config.JwtUtil;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.dto.LoginRequestDto;
import com.example.ImproveComsumption.dto.LoginResponseDto;
import com.example.ImproveComsumption.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthService {

    private final AuthenticationManager authenticationManager;
    private final MemberRepository memberRepository;
    private final JwtUtil jwtUtil;

    public LoginResponseDto login(LoginRequestDto requestDto) {
        // Spring Security 인증 (ID & PW 체크)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
        );

        // 사용자 정보 가져오기
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // ✅ JWT 생성 (email & role 포함)
        String token = jwtUtil.generateToken(member.getEmail());

        // ✅ JWT 포함한 UserResponseDto 반환
        return new LoginResponseDto(token, member.getEmail());
    }
}

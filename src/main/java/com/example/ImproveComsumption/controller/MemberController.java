package com.example.ImproveComsumption.controller;


import com.example.ImproveComsumption.config.JwtUtil;
import com.example.ImproveComsumption.domain.Member;
import com.example.ImproveComsumption.dto.LoginRequestDto;
import com.example.ImproveComsumption.dto.LoginResponseDto;
import com.example.ImproveComsumption.dto.SignupRequestDto;
import com.example.ImproveComsumption.dto.SignupResponseDto;
import com.example.ImproveComsumption.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController@CrossOrigin(origins = {"http://localhost:3000", "http://223.130.136.121:3000"})
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@Valid @RequestBody SignupRequestDto dto) {
        memberService.registerMember(dto);
        SignupResponseDto response = new SignupResponseDto("회원가입이 완료되었습니다.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto requestDto) {
        Member member = memberService.login(requestDto.getEmail(), requestDto.getPassword());

        String token = jwtUtil.generateToken(member.getEmail());
        LoginResponseDto response = new LoginResponseDto(token, member.getEmail());

        return ResponseEntity.ok(response);
    }

}

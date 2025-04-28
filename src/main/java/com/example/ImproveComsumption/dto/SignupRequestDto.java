package com.example.ImproveComsumption.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SignupRequestDto {
    private String email;
    private String password;
    private String name;
}

package com.example.ImproveComsumption.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequestDto {

    private String newPassword;
    private String confirmPassword;

}

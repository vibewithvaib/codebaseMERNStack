package com.campus.authservice2.dto;

import lombok.Data;

@Data
public class CreateUserRequestDto {
    private String email;
    private String password;
}


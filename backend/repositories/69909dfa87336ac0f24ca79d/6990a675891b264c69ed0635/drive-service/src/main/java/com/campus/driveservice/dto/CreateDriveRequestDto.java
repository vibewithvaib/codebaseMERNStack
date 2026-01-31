package com.campus.driveservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateDriveRequestDto {
    private String companyName;
    private String role;
    private String description;

    private Double minTenth;
    private Double minTwelfth;
    private List<String> skills;

    private List<RoundDto> rounds;
}

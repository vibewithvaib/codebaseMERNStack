package com.campus.driveservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentEligibilityDto {
    private Long studentId;
    private String email;
    private Double tenthMarks;
    private Double twelfthMarks;
    private List<String> skills;
}


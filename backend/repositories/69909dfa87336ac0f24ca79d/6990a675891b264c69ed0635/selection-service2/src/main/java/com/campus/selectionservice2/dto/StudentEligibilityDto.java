package com.campus.selectionservice2.dto;

import lombok.Data;

import java.util.List;

@Data
public class StudentEligibilityDto {

    private String email;
    private Double tenthMarks;
    private Double twelfthMarks;
    private List<String> skills;
}



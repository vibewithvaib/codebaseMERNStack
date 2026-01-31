package com.campus.profileservice2.dto;

import lombok.Data;

import java.util.List;

@Data
public class StudentProfileRequestDto {

    private String fullName;
    private String rollNo;
    private String branch;
    private String college;

    private Double tenthMarks;
    private Double twelfthMarks;
    private Double cgpa;

    private List<String> skills;
    private List<StudentDocumentDto> documents;
    private List<StudentExperienceDto> experiences;
}



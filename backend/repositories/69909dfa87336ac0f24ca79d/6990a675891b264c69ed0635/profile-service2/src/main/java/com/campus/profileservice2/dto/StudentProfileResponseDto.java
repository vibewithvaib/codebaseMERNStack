package com.campus.profileservice2.dto;

import com.campus.profileservice2.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentProfileResponseDto {

    private Long id;
    private String email;
    private String fullName;
    private String rollNo;
    private String branch;
    private boolean verified;
    private boolean blacklisted;

    private StudentAcademics academics;
    private List<StudentSkill> skills;
    private List<StudentDocument> documents;
    private List<StudentExperience> experiences;
}




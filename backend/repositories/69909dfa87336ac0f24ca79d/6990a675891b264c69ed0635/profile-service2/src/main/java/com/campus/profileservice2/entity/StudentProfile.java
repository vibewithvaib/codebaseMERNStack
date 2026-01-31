package com.campus.profileservice2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class StudentProfile {

    @Id
    @GeneratedValue
    private Long id;

    private String email;
    private String fullName;
    private String rollNo;
    private String branch;
    private String college;

    private boolean verified = false;
    private boolean blacklisted = false;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonIgnore
    private StudentAcademics academics;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<StudentSkill> skills;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<StudentDocument> documents;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<StudentExperience> experiences;
}




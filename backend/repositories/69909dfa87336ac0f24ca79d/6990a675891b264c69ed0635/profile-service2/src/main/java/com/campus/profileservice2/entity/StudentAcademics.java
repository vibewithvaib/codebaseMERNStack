package com.campus.profileservice2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudentAcademics {

    @Id
    @GeneratedValue
    private Long id;

    private Double tenthMarks;
    private Double twelfthMarks;
    private Double cgpa;

    @OneToOne
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private StudentProfile student;
}



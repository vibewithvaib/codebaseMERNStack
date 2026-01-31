package com.campus.profileservice2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudentExperience {

    @Id
    @GeneratedValue
    private Long id;

    private String company;
    private String role;
    private String duration;
    private String description;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private StudentProfile student;
}


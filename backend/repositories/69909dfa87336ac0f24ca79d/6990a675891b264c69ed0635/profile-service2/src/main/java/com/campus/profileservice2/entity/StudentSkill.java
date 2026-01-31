package com.campus.profileservice2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudentSkill {

    @Id
    @GeneratedValue
    private Long id;

    private String skill;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private StudentProfile student;
}



package com.campus.profileservice2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudentDocument {

    @Id
    @GeneratedValue
    private Long id;

    private String type;
    private String url;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonIgnore
    private StudentProfile student;
}



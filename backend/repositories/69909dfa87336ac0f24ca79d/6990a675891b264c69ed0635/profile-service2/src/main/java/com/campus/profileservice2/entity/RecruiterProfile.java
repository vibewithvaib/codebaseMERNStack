package com.campus.profileservice2.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class RecruiterProfile {

    @Id
    @GeneratedValue
    private Long id;

    private String email;
    private String companyName;
    private String designation;
    private String description;
}



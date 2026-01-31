package com.campus.driveservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Drive {

    @Id
    @GeneratedValue
    private Long id;

    private String companyName;
    private String role;
    private String description;

    private String recruiterEmail;

    @Enumerated(EnumType.STRING)
    private DriveStatus status = DriveStatus.CREATED;
}


package com.campus.driveservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class DriveRound {

    @Id
    @GeneratedValue
    private Long id;

    private String name; // Aptitude, Technical, HR
    private Integer roundNumber;

    @ManyToOne
    @JsonIgnore
    private Drive drive;
}

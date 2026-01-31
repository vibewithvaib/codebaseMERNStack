package com.campus.selectionservice2.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class FinalPlacement {

    @Id
    @GeneratedValue
    private Long id;

    private Long driveId;
    private String studentEmail;
    private boolean accepted;

    private LocalDateTime placedAt;
}


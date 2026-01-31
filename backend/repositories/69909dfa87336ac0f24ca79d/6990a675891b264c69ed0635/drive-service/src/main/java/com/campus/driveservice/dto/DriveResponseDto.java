package com.campus.driveservice.dto;

import com.campus.driveservice.model.DriveCriteria;
import com.campus.driveservice.model.DriveRound;
import com.campus.driveservice.model.DriveStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DriveResponseDto {

    private Long id;
    private String companyName;
    private String role;
    private String description;
    private String recruiterEmail;
    private DriveStatus status;

    private DriveCriteria criteria;
    private List<DriveRound> rounds;
}


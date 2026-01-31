package com.campus.selectionservice2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriveProgressDto {
    private Long driveId;
    private int totalStudents;
    private int activeStudents;
    private int rejectedStudents;
    private int selectedStudents;
}


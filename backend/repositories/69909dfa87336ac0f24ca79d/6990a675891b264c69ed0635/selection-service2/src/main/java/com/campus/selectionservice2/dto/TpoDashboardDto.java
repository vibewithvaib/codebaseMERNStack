package com.campus.selectionservice2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class TpoDashboardDto {

    private long totalDrives;
    private long totalStudents;
    private long totalPlaced;
    private long totalRejected;
    private long activeStudents;

    private Map<Long, DriveStatsDto> driveWiseStats;
}

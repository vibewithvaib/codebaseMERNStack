package com.campus.selectionservice2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DriveStatsDto {

    private long total;
    private long active;
    private long rejected;
    private long selected;
}


package com.campus.selectionservice2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SelectionStatusDto {

    private Long driveId;
    private int currentRound;

    private boolean invited;
    private boolean acceptedInvite;

    private boolean active;
    private boolean selected;
    private boolean rejected;
}



package com.campus.selectionservice2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriveStudentsResponseDto {

    // key = round number, value = students in that round
    private Map<Integer, List<String>> roundWiseStudents;

    private List<String> rejected;
    private List<String> selected;
}



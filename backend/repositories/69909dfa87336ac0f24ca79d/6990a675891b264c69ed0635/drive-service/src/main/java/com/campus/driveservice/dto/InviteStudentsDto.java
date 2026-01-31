package com.campus.driveservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InviteStudentsDto {

    private Long driveId;
    private List<String> studentEmails;
}


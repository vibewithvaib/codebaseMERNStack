package com.campus.profileservice2.dto;

import lombok.Data;

@Data
public class StudentDocumentDto {
    private String type;   // 10TH, 12TH, RESUME, CERTIFICATE
    private String url;
}



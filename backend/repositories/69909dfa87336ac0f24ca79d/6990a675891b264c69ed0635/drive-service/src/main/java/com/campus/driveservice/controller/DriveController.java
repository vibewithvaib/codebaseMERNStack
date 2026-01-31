package com.campus.driveservice.controller;

import com.campus.driveservice.dto.CreateDriveRequestDto;
import com.campus.driveservice.dto.DriveResponseDto;
import com.campus.driveservice.service.DriveService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drive")
@RequiredArgsConstructor
public class DriveController {

    private final DriveService service;

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateDriveRequestDto dto,
            HttpServletRequest request
    ) {
        if (!"RECRUITER".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                service.createDrive(
                        (String) request.getAttribute("email"),
                        dto
                )
        );
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> start(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        if (!"RECRUITER".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(service.startDrive(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        DriveResponseDto dto = service.getDrive(id);

        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("email");

        if ("RECRUITER".equals(role) &&
                !dto.getRecruiterEmail().equals(email)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<?> all(HttpServletRequest request) {
        return ResponseEntity.ok(
                service.getDrivesForRole(
                        (String) request.getAttribute("role"),
                        (String) request.getAttribute("email")
                )
        );
    }

    @GetMapping("/{id}/owner")
    public String getOwner(@PathVariable Long id) {
        return service.getDrive(id).getRecruiterEmail();
    }

    @GetMapping("/{id}/eligible-preview")
    public ResponseEntity<?> previewEligible(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        if (!"RECRUITER".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(service.previewEligibleStudents(id));
    }


}

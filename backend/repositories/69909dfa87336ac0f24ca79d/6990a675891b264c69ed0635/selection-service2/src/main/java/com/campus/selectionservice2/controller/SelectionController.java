package com.campus.selectionservice2.controller;

import com.campus.selectionservice2.client.DriveClient;
import com.campus.selectionservice2.dto.*;
import com.campus.selectionservice2.service.SelectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/selection")
@RequiredArgsConstructor
public class SelectionController {

    private final SelectionService service;
    private final DriveClient driveClient;

    /* ================================
       RECRUITER: INVITE STUDENTS
       ================================ */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteStudents(
            @RequestBody InviteStudentsDto dto,
            HttpServletRequest request
    ) {
        if (!"RECRUITER".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        service.inviteStudents(dto.getDriveId(),dto.getStudentEmails());
        return ResponseEntity.ok().build();
    }

    /* ================================
       RECRUITER: SHORTLIST NEXT ROUND
       ================================ */
    @PostMapping("/shortlist")
    public ResponseEntity<?> shortlistNextRound(
            @RequestBody ShortlistRequestDto dto,
            @RequestParam int totalRounds,
            HttpServletRequest request
    ) {
        String owner = driveClient.getDriveOwner(dto.getDriveId());
        if (!"RECRUITER".equals(request.getAttribute("role")) ||
                !owner.equals(request.getAttribute("email"))) {
            return ResponseEntity.status(403).build();
        }

        service.shortlistNextRound(
                dto.getDriveId(),
                totalRounds,
                dto.getSelectedStudentEmails()
        );

        return ResponseEntity.ok().build();
    }

    /* ================================
       RECRUITER: FINAL SELECT
       ================================ */
    @PostMapping("/final-select")
    public ResponseEntity<?> finalSelect(
            @RequestBody ShortlistRequestDto dto,
            HttpServletRequest request
    ) {
        if (!"RECRUITER".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        service.finalSelect(
                dto.getDriveId(),
                dto.getSelectedStudentEmails()
        );

        return ResponseEntity.ok().build();
    }

    /* ================================
       STUDENT: VIEW STATUS
       ================================ */
    @GetMapping("/status")
    public ResponseEntity<List<SelectionStatusDto>> studentStatus(
            HttpServletRequest request
    ) {
        if (!"STUDENT".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        String email = (String) request.getAttribute("email");
        return ResponseEntity.ok(
                service.getStudentStatus(email)
        );
    }

    /* ================================
       STUDENT: ACCEPT FINAL OFFER
       ================================ */
    @PostMapping("/accept")
    public ResponseEntity<?> acceptOffer(
            @RequestBody FinalOfferDto dto,
            HttpServletRequest request
    ) {
        if (!"STUDENT".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        String email = (String) request.getAttribute("email");
        service.acceptOffer(email, dto.getDriveId());
        return ResponseEntity.ok().build();
    }

    /* ================================
       TPO / RECRUITER: DRIVE PROGRESS
       ================================ */
    @GetMapping("/drive/{driveId}/progress")
    public ResponseEntity<?> driveProgress(
            @PathVariable Long driveId,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("email");

        if ("RECRUITER".equals(role)) {
            String owner = driveClient.getDriveOwner(driveId);
            if (!owner.equals(email)) {
                return ResponseEntity.status(403).build();
            }
        }

        if (!("TPO".equals(role) || "RECRUITER".equals(role))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(service.getDriveProgress(driveId));
    }

    @GetMapping("/drive/{driveId}/students")
    public ResponseEntity<?> driveStudents(
            @PathVariable Long driveId,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("email");

        if ("RECRUITER".equals(role)) {
            String owner = driveClient.getDriveOwner(driveId);
            if (!owner.equals(email)) {
                return ResponseEntity.status(403).build();
            }
        }

        if (!("TPO".equals(role) || "RECRUITER".equals(role))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(service.getStudentsOfDrive(driveId));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvite(
            @RequestBody AcceptInviteDto dto,
            HttpServletRequest request
    ) {
        if (!"STUDENT".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        service.acceptInvite(
                (String) request.getAttribute("email"),
                dto.getDriveId()
        );

        return ResponseEntity.ok().build();
    }
    @GetMapping("/dashboard")
    public ResponseEntity<?> tpoDashboard(HttpServletRequest request) {

        if (!"TPO".equals(request.getAttribute("role"))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(service.getTpoDashboard());
    }



}


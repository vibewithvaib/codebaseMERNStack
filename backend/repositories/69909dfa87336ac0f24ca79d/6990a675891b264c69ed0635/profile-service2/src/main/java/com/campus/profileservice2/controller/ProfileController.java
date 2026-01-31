package com.campus.profileservice2.controller;

import com.campus.profileservice2.dto.RecruiterProfileRequestDto;
import com.campus.profileservice2.dto.StudentEligibilityDto;
import com.campus.profileservice2.dto.StudentProfileRequestDto;
import com.campus.profileservice2.dto.StudentProfileResponseDto;
import com.campus.profileservice2.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/student")
    public ResponseEntity<?> createOrUpdateProfile(
            @RequestBody StudentProfileRequestDto dto,
            HttpServletRequest request
    ) {
        String email = (String) request.getAttribute("email");
        profileService.saveStudentProfile(email, dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/verify/{studentId}")
    public ResponseEntity<?> verifyStudent(@PathVariable Long studentId) {
        profileService.verifyStudent(studentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recruiter")
    public ResponseEntity<?> createRecruiterProfile(
            @RequestBody RecruiterProfileRequestDto dto
    ) {
        profileService.createRecruiterProfile(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentProfileResponseDto> getFullProfile(
            @PathVariable Long studentId,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("email");

        StudentProfileResponseDto profile =
                profileService.getFullProfile(studentId);

        if ("STUDENT".equals(role)) {
            if (!profile.getEmail().equals(email)) {
                return ResponseEntity.status(403).build();
            }
        }

        if (!("TPO".equals(role) || "RECRUITER".equals(role) || "STUDENT".equals(role))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(profile);
    }



    @GetMapping("/students")
    public ResponseEntity<Page<StudentProfileResponseDto>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");

        if ("RECRUITER".equals(role)) {
            return ResponseEntity.ok(
                    profileService.getEligibleStudentsForRecruiter(page, size)
            );
        }

        return ResponseEntity.ok(
                profileService.getStudents(page, size)
        );

    }
    @GetMapping("/students/search")
    public ResponseEntity<?> searchStudents(
            @RequestParam(required = false) String branch,
            @RequestParam(required = false) Double min10,
            @RequestParam(required = false) Double min12,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        if (!("RECRUITER".equals(request.getAttribute("role")) ||
                "TPO".equals(request.getAttribute("role")))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                profileService.searchStudents(branch, min10, min12, page, size)
        );
    }


    @GetMapping("/eligible")
    public ResponseEntity<?> getEligibleStudents() {
        return ResponseEntity.ok(
                profileService.getEligibleStudents()
        );
    }

    @PostMapping("/blacklist/{email}")
    public ResponseEntity<?> blacklistStudent(@PathVariable String email) {
        profileService.blacklistStudentByEmail(email);
        return ResponseEntity.ok().build();
    }
}



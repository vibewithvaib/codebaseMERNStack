package com.campus.authservice2.controller;

import com.campus.authservice2.dto.CreateUserRequestDto;
import com.campus.authservice2.dto.LoginRequestDto;
import com.campus.authservice2.entity.Role;
import com.campus.authservice2.service.AuthService;
import com.campus.authservice2.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequestDto dto
    ) {
        return ResponseEntity.ok(
                service.login(dto.getEmail(), dto.getPassword())
        );
    }

    @PostMapping("/create-tpo")
    public ResponseEntity<?> createTpo(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateUserRequestDto dto
    ) {
        checkRole(auth, "ADMIN");
        service.createUser(dto.getEmail(), Role.TPO, dto.getPassword());
        return ResponseEntity.ok("TPO CREATED");
    }

    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateUserRequestDto dto
    ) {
        checkRole(auth, "ADMIN");
        service.createUser(dto.getEmail(), Role.STUDENT, dto.getPassword());
        return ResponseEntity.ok("STUDENT CREATED");
    }

    @PostMapping("/create-recruiter")
    public ResponseEntity<?> createRecruiter(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateUserRequestDto dto
    ) {
        checkRole(auth, "TPO");
        service.createUser(dto.getEmail(), Role.RECRUITER, dto.getPassword());
        return ResponseEntity.ok("RECRUITER CREATED");
    }

    private void checkRole(String authHeader, String requiredRole) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing token");
        }

        Claims claims = jwtUtil.parse(authHeader.substring(7));

        if (!requiredRole.equals(claims.get("role"))) {
            throw new RuntimeException("Forbidden");
        }
    }
}

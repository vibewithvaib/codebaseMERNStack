package com.campus.authservice2.service;

import com.campus.authservice2.entity.Role;
import com.campus.authservice2.entity.User;
import com.campus.authservice2.repository.UserRepository;
import com.campus.authservice2.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;


    public void createUser(String email, Role role, String password) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(encoder.encode(password));
        u.setRole(role);
        repo.save(u);
    }

    public String login(String email, String password) {
        User u = repo.findByEmail(email).orElseThrow();

        if (!encoder.matches(password, u.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generate(email, u.getRole().name());
    }
}


package com.campus.authservice2;

import com.campus.authservice2.entity.Role;
import com.campus.authservice2.entity.User;
import com.campus.authservice2.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String password;
    @PostConstruct
    public void init() {
        if (repo.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(encoder.encode(password));
            admin.setRole(Role.ADMIN);
            repo.save(admin);
        }
    }
}

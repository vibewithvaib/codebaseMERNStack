package com.campus.selectionservice2.client;

import com.campus.selectionservice2.dto.StudentEligibilityDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@FeignClient(
        name = "profile-service2",
        path = "/api/profile"
)
public interface ProfileClient {

    @GetMapping("/eligible")
    List<StudentEligibilityDto> getEligibleStudents();

    @PostMapping("/blacklist/{email}")
    void blacklistStudent(@PathVariable String email);
}


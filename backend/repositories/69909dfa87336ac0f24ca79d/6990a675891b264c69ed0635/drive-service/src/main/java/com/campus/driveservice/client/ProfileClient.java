package com.campus.driveservice.client;

import com.campus.driveservice.dto.StudentEligibilityDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "profile-service2")
public interface ProfileClient {
    @GetMapping("/api/profile/eligible")
    List<StudentEligibilityDto> getEligibleStudents();
}


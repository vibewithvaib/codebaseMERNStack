package com.campus.driveservice.client;

import com.campus.driveservice.dto.InviteStudentsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "selection-service2")
public interface SelectionClient {
    @PostMapping("/api/selection/invite")
    void invite(@RequestBody InviteStudentsDto dto);
}


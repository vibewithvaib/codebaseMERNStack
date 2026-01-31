package com.campus.selectionservice2.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "drive-service", path = "/api/drive")
public interface DriveClient {

    @GetMapping("/{id}/owner")
    String getDriveOwner(@PathVariable Long id);
}

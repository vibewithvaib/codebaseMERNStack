package com.campus.driveservice.repository;

import com.campus.driveservice.model.Drive;
import com.campus.driveservice.model.DriveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriveRepository extends JpaRepository<Drive, Long> {

    List<Drive> findByRecruiterEmail(String recruiterEmail);

    List<Drive> findByStatus(DriveStatus status);
}

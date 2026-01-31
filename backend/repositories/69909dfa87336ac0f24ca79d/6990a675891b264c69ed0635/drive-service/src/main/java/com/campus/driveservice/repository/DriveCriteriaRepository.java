package com.campus.driveservice.repository;

import com.campus.driveservice.model.Drive;
import com.campus.driveservice.model.DriveCriteria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriveCriteriaRepository extends JpaRepository<DriveCriteria, Long> {
    DriveCriteria findByDrive(Drive drive);
}

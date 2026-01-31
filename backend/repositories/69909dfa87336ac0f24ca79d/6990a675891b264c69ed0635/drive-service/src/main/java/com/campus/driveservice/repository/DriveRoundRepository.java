package com.campus.driveservice.repository;

import com.campus.driveservice.model.Drive;
import com.campus.driveservice.model.DriveRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriveRoundRepository extends JpaRepository<DriveRound, Long> {
    List<DriveRound> findByDrive(Drive drive);
}

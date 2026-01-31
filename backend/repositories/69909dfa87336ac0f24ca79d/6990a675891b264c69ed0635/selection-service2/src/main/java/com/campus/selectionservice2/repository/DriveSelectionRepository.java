package com.campus.selectionservice2.repository;

import com.campus.selectionservice2.model.DriveSelection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DriveSelectionRepository
        extends JpaRepository<DriveSelection, Long> {

    Optional<DriveSelection> findByDriveIdAndStudentEmail(Long driveId, String email);

    List<DriveSelection> findByDriveId(Long driveId);

    List<DriveSelection> findByDriveIdAndActiveTrue(Long driveId);

    List<DriveSelection> findByStudentEmail(String email);
    long countByActiveTrue();
    long countByRejectedTrue();
    long countBySelectedTrue();

}

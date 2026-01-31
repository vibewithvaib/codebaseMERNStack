package com.campus.selectionservice2.repository;

import com.campus.selectionservice2.model.FinalPlacement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinalPlacementRepository
        extends JpaRepository<FinalPlacement, Long> {

    Optional<FinalPlacement> findByStudentEmailAndDriveId(String email,Long driveId);

    boolean existsByStudentEmail(String email);
    long countByAcceptedTrue();

}

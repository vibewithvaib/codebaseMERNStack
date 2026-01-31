package com.campus.profileservice2.repository;

import com.campus.profileservice2.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository
        extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByEmail(String email);

    Page<StudentProfile> findByVerifiedTrueAndBlacklistedFalse(Pageable pageable);
    List<StudentProfile> findByVerifiedTrueAndBlacklistedFalse();
    Page<StudentProfile> findByBranchAndVerifiedTrueAndBlacklistedFalse(
            String branch,
            Pageable pageable
    );

}


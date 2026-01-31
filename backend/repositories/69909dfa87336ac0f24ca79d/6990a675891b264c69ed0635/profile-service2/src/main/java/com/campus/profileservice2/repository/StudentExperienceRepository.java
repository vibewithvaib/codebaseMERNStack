package com.campus.profileservice2.repository;

import com.campus.profileservice2.entity.StudentExperience;
import com.campus.profileservice2.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentExperienceRepository
        extends JpaRepository<StudentExperience, Long> {

    List<StudentExperience> findByStudent(StudentProfile student);

    void deleteByStudent(StudentProfile student);
}


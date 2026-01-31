package com.campus.profileservice2.repository;

import com.campus.profileservice2.entity.StudentAcademics;
import com.campus.profileservice2.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAcademicsRepository
        extends JpaRepository<StudentAcademics, Long> {

    StudentAcademics findByStudent(StudentProfile student);

    void deleteByStudent(StudentProfile student);
}


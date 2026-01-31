package com.campus.profileservice2.repository;

import com.campus.profileservice2.entity.StudentDocument;
import com.campus.profileservice2.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentDocumentRepository
        extends JpaRepository<StudentDocument, Long> {

    List<StudentDocument> findByStudent(StudentProfile student);

    void deleteByStudent(StudentProfile student);
}



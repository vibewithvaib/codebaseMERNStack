package com.campus.profileservice2.repository;

import com.campus.profileservice2.entity.StudentProfile;
import com.campus.profileservice2.entity.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSkillRepository
        extends JpaRepository<StudentSkill, Long> {

    List<StudentSkill> findByStudent(StudentProfile student);

    void deleteByStudent(StudentProfile student);
}

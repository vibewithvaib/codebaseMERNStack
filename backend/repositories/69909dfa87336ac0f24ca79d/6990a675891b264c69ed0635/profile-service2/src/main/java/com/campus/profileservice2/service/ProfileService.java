package com.campus.profileservice2.service;

import com.campus.profileservice2.dto.*;
import com.campus.profileservice2.entity.*;
import com.campus.profileservice2.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final StudentProfileRepository profileRepo;
    private final StudentAcademicsRepository academicsRepo;
    private final StudentSkillRepository skillRepo;
    private final StudentDocumentRepository docRepo;
    private final StudentExperienceRepository expRepo;
    private final RecruiterProfileRepository recruiterRepo;

    /* ================================
       STUDENT CREATES / UPDATES PROFILE
       ================================ */
    public void saveStudentProfile(String email, StudentProfileRequestDto dto) {

        StudentProfile profile = profileRepo
                .findByEmail(email)
                .orElseGet(StudentProfile::new);

        profile.setEmail(email);
        profile.setFullName(dto.getFullName());
        profile.setRollNo(dto.getRollNo());
        profile.setBranch(dto.getBranch());
        profile.setCollege(dto.getCollege());

        StudentProfile savedProfile = profileRepo.save(profile);

        // ---------- Academics ----------
        academicsRepo.deleteByStudent(savedProfile);
        StudentAcademics ac = new StudentAcademics();
        ac.setStudent(savedProfile);
        ac.setTenthMarks(dto.getTenthMarks());
        ac.setTwelfthMarks(dto.getTwelfthMarks());
        ac.setCgpa(dto.getCgpa());
        academicsRepo.save(ac);

        // ---------- Skills ----------
        skillRepo.deleteByStudent(savedProfile);
        for (String s : dto.getSkills()) {
            StudentSkill skill = new StudentSkill();
            skill.setSkill(s);
            skill.setStudent(savedProfile);
            skillRepo.save(skill);
        }

        // ---------- Documents ----------
        docRepo.deleteByStudent(savedProfile);
        for (StudentDocumentDto d : dto.getDocuments()) {
            StudentDocument doc = new StudentDocument();
            doc.setStudent(savedProfile);
            doc.setType(d.getType());
            doc.setUrl(d.getUrl());
            docRepo.save(doc);
        }

        // ---------- Experiences ----------
        expRepo.deleteByStudent(savedProfile);
        for (StudentExperienceDto e : dto.getExperiences()) {
            StudentExperience ex = new StudentExperience();
            ex.setStudent(savedProfile);
            ex.setCompany(e.getCompany());
            ex.setRole(e.getRole());
            ex.setDuration(e.getDuration());
            ex.setDescription(e.getDescription());
            expRepo.save(ex);
        }
    }

    /* ================================
       TPO VERIFIES STUDENT PROFILE
       ================================ */
    public void verifyStudent(Long studentId) {
        StudentProfile p = profileRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        p.setVerified(true);
        profileRepo.save(p);
    }

    /* ================================
       TPO CREATES RECRUITER PROFILE
       ================================ */
    public void createRecruiterProfile(RecruiterProfileRequestDto dto) {
        RecruiterProfile rp = new RecruiterProfile();
        rp.setEmail(dto.getEmail());
        rp.setCompanyName(dto.getCompanyName());
        rp.setDesignation(dto.getDesignation());
        rp.setDescription(dto.getDescription());
        recruiterRepo.save(rp);
    }

    /* ================================
       BLACKLIST STUDENT (FROM SELECTION)
       ================================ */
    public void blacklistStudentByEmail(String email) {
        StudentProfile p = profileRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        p.setBlacklisted(true);
        profileRepo.save(p);
    }

    /* ================================
       FULL PROFILE VIEW (TPO/RECRUITER)
       ================================ */
    @Transactional(readOnly = true)
    public StudentProfileResponseDto getFullProfile(Long studentId) {

        StudentProfile p = profileRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return new StudentProfileResponseDto(
                p.getId(),
                p.getEmail(),
                p.getFullName(),
                p.getRollNo(),
                p.getBranch(),
                p.isVerified(),
                p.isBlacklisted(),
                academicsRepo.findByStudent(p),
                skillRepo.findByStudent(p),
                docRepo.findByStudent(p),
                expRepo.findByStudent(p)
        );
    }

    /* ================================
       ELIGIBLE STUDENTS (DRIVE SERVICE)
       ================================ */
    @Transactional(readOnly = true)
    public List<StudentEligibilityDto> getEligibleStudents() {

        return profileRepo.findByVerifiedTrueAndBlacklistedFalse()
                .stream()
                .map(s -> {
                    StudentEligibilityDto dto = new StudentEligibilityDto();
                    dto.setStudentId(s.getId());
                    dto.setEmail(s.getEmail());
                    dto.setTenthMarks(s.getAcademics().getTenthMarks());
                    dto.setTwelfthMarks(s.getAcademics().getTwelfthMarks());
                    dto.setSkills(
                            s.getSkills().stream()
                                    .map(StudentSkill::getSkill)
                                    .toList()
                    );
                    return dto;
                })
                .toList();
    }


    /* ================================
       PAGINATED STUDENT LIST (FRONTEND)
       ================================ */
    @Transactional(readOnly = true)
    public Page<StudentProfileResponseDto> getStudents(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return profileRepo.findAll(pageable)
                .map(s -> new StudentProfileResponseDto(
                        s.getId(),
                        s.getEmail(),
                        s.getFullName(),
                        s.getRollNo(),
                        s.getBranch(),
                        s.isVerified(),
                        s.isBlacklisted(),
                        s.getAcademics(),
                        s.getSkills(),
                        s.getDocuments(),
                        s.getExperiences()
                ));
    }
    @Transactional(readOnly = true)
    public Page<StudentProfileResponseDto> getEligibleStudentsForRecruiter(
            int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return profileRepo
                .findByVerifiedTrueAndBlacklistedFalse(pageable)
                .map(s -> new StudentProfileResponseDto(
                        s.getId(),
                        s.getEmail(),
                        s.getFullName(),
                        s.getRollNo(),
                        s.getBranch(),
                        s.isVerified(),
                        s.isBlacklisted(),
                        s.getAcademics(),
                        s.getSkills(),
                        s.getDocuments(),
                        s.getExperiences()
                ));
    }
    @Transactional(readOnly = true)
    public Page<StudentProfileResponseDto> searchStudents(
            String branch,
            Double minTenth,
            Double minTwelfth,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<StudentProfile> pageResult = profileRepo.findAll(pageable);

        List<StudentProfileResponseDto> filtered = pageResult.getContent()
                .stream()
                .filter(s -> branch == null || s.getBranch().equalsIgnoreCase(branch))
                .filter(s -> minTenth == null || s.getAcademics().getTenthMarks() >= minTenth)
                .filter(s -> minTwelfth == null || s.getAcademics().getTwelfthMarks() >= minTwelfth)
                .map(this::mapToDto)
                .toList();

        return new PageImpl<>(
                filtered,
                pageable,
                pageResult.getTotalElements()
        );
    }


    private StudentProfileResponseDto mapToDto(StudentProfile s) {
        return new StudentProfileResponseDto(
                s.getId(),
                s.getEmail(),
                s.getFullName(),
                s.getRollNo(),
                s.getBranch(),
                s.isVerified(),
                s.isBlacklisted(),
                s.getAcademics(),
                s.getSkills(),
                s.getDocuments(),
                s.getExperiences()
        );
    }



}
package com.campus.selectionservice2.service;

import com.campus.selectionservice2.client.ProfileClient;
import com.campus.selectionservice2.dto.*;
import com.campus.selectionservice2.model.DriveSelection;
import com.campus.selectionservice2.model.FinalPlacement;
import com.campus.selectionservice2.repository.DriveSelectionRepository;
import com.campus.selectionservice2.repository.FinalPlacementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class SelectionService {

    private final DriveSelectionRepository selectionRepo;
    private final FinalPlacementRepository placementRepo;
    private final ProfileClient profileClient;

    /* ================================
       RECRUITER: INVITE STUDENTS
       ================================ */
    public void inviteStudents(Long driveId, List<String> emails) {

        for (String email : emails) {

            if (selectionRepo
                    .findByDriveIdAndStudentEmail(driveId, email)
                    .isPresent()) continue;

            DriveSelection ds = new DriveSelection();
            ds.setDriveId(driveId);
            ds.setStudentEmail(email);
            ds.setCurrentRound(1);

            ds.setInvited(true);
            ds.setAcceptedInvite(false);  // student not yet accepted
            ds.setActive(false);           // not active until accept

            ds.setUpdatedAt(LocalDateTime.now());

            selectionRepo.save(ds);
        }
    }



    /* ================================
       STUDENT: VIEW STATUS
       ================================ */
    @Transactional(readOnly = true)
    public List<SelectionStatusDto> getStudentStatus(String email) {

        return selectionRepo.findByStudentEmail(email)
                .stream()
                .map(s -> new SelectionStatusDto(
                        s.getDriveId(),
                        s.getCurrentRound(),
                        s.isInvited(),
                        s.isAcceptedInvite(),
                        s.isActive(),
                        s.isSelected(),
                        s.isRejected()
                ))
                .toList();
    }

    /* ================================
       RECRUITER: SHORTLIST NEXT ROUND
       ================================ */
    public void shortlistNextRound(
            Long driveId,
            int totalRounds,
            List<String> selectedEmails
    ) {

        List<DriveSelection> active =
                selectionRepo.findByDriveIdAndActiveTrue(driveId);

        for (DriveSelection ds : active) {

            if (selectedEmails.contains(ds.getStudentEmail())) {

                if (ds.getCurrentRound() >= totalRounds) {
                    throw new RuntimeException("Max rounds reached");
                }

                ds.setCurrentRound(ds.getCurrentRound() + 1);
                ds.setUpdatedAt(LocalDateTime.now());
            } else {
                ds.setActive(false);
                ds.setRejected(true);
            }

            selectionRepo.save(ds);
        }
    }

    /* ================================
       RECRUITER: FINAL SELECT
       ================================ */
    public void finalSelect(Long driveId, List<String> selectedEmails) {

        for (String email : selectedEmails) {

            if (placementRepo.existsByStudentEmail(email)) {
                throw new RuntimeException("Student already placed");
            }

            DriveSelection ds = selectionRepo
                    .findByDriveIdAndStudentEmail(driveId, email)
                    .orElseThrow();

            ds.setSelected(true);
            ds.setActive(false);
            ds.setUpdatedAt(LocalDateTime.now());
            selectionRepo.save(ds);

            FinalPlacement fp = new FinalPlacement();
            fp.setDriveId(driveId);
            fp.setStudentEmail(email);
            fp.setAccepted(false);
            fp.setPlacedAt(LocalDateTime.now());
            placementRepo.save(fp);
        }
    }

    /* ================================
       STUDENT: ACCEPT OFFER
       ================================ */
    public void acceptOffer(String email, Long driveId) {

        FinalPlacement fp = placementRepo.findByStudentEmailAndDriveId(email,driveId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        fp.setAccepted(true);
        placementRepo.save(fp);

        profileClient.blacklistStudent(email);
    }

    /* ================================
       DASHBOARD: DRIVE PROGRESS
       ================================ */
    @Transactional(readOnly = true)
    public DriveProgressDto getDriveProgress(Long driveId) {

        List<DriveSelection> all = selectionRepo.findByDriveId(driveId);

        int total = all.size();
        int active = (int) all.stream().filter(DriveSelection::isActive).count();
        int rejected = (int) all.stream().filter(DriveSelection::isRejected).count();
        int selected = (int) all.stream().filter(DriveSelection::isSelected).count();

        return new DriveProgressDto(driveId, total, active, rejected, selected);
    }

    @Transactional(readOnly = true)
    public DriveStudentsResponseDto getStudentsOfDrive(Long driveId) {

        List<DriveSelection> all = selectionRepo.findByDriveId(driveId);

        Map<Integer, List<String>> roundMap = new HashMap<>();
        List<String> rejected = new ArrayList<>();
        List<String> selected = new ArrayList<>();

        for (DriveSelection ds : all) {

            if (ds.isRejected()) {
                rejected.add(ds.getStudentEmail());
                continue;
            }

            if (ds.isSelected()) {
                selected.add(ds.getStudentEmail());
                continue;
            }

            roundMap
                    .computeIfAbsent(ds.getCurrentRound(), k -> new ArrayList<>())
                    .add(ds.getStudentEmail());
        }

        return new DriveStudentsResponseDto(roundMap, rejected, selected);
    }

    public void acceptInvite(String email, Long driveId) {

        DriveSelection ds = selectionRepo
                .findByDriveIdAndStudentEmail(driveId, email)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (ds.isAcceptedInvite()) return;

        ds.setAcceptedInvite(true);
        ds.setActive(true);
        ds.setUpdatedAt(LocalDateTime.now());

        selectionRepo.save(ds);
    }

    @Transactional(readOnly = true)
    public TpoDashboardDto getTpoDashboard() {

        List<DriveSelection> all = selectionRepo.findAll();

        long totalStudents = all.size();
        long active = all.stream().filter(DriveSelection::isActive).count();
        long rejected = all.stream().filter(DriveSelection::isRejected).count();
        long selected = all.stream().filter(DriveSelection::isSelected).count();
        long placed = placementRepo.countByAcceptedTrue();

        Map<Long, DriveStatsDto> driveMap = new HashMap<>();

        for (DriveSelection ds : all) {
            driveMap.computeIfAbsent(ds.getDriveId(), id -> new DriveStatsDto(0,0,0,0));
            DriveStatsDto d = driveMap.get(ds.getDriveId());

            d.setTotal(d.getTotal() + 1);
            if (ds.isActive()) d.setActive(d.getActive() + 1);
            if (ds.isRejected()) d.setRejected(d.getRejected() + 1);
            if (ds.isSelected()) d.setSelected(d.getSelected() + 1);
        }

        return new TpoDashboardDto(
                driveMap.size(),
                totalStudents,
                placed,
                rejected,
                active,
                driveMap
        );
    }



}
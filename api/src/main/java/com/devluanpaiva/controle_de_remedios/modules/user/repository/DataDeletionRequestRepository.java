package com.devluanpaiva.controle_de_remedios.modules.user.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.DataDeletionRequest;

public interface DataDeletionRequestRepository extends JpaRepository<DataDeletionRequest, UUID> {
}

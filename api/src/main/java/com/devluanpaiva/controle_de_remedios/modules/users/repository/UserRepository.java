package com.devluanpaiva.controle_de_remedios.modules.users.repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    Optional<User> findById(UUID id);

    Page<User> findByRoleIn(Collection<UserRole> roles, Pageable pageable);

    Page<User> findByCompanies_Id(UUID companyId, Pageable pageable);
}

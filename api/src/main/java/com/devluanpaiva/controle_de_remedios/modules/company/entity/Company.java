package com.devluanpaiva.controle_de_remedios.modules.company.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;

@Entity
@Table(name = "companies")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(nullable = true, length = 255, name = "image_url")
    private String imageUrl;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active;

    @ManyToMany(mappedBy = "companies")
    @Builder.Default
    private Set<User> users = new HashSet<>();

    @CreatedDate
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean hasUser(UUID userId) {
        return users.stream().anyMatch(user -> user.getId().equals(userId));
    }
}

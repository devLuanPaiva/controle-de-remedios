package com.devluanpaiva.controle_de_remedios.modules.user.enums;

import java.util.Set;

public enum UserRole {

	ADMIN,

	MANAGER,

	USER,

	PATIENT;

	public Set<UserRole> manageableRoles() {
		return switch (this) {
			case ADMIN -> Set.of(MANAGER, USER, PATIENT);
			case MANAGER -> Set.of(USER, PATIENT);
			case USER -> Set.of();
			case PATIENT -> Set.of();
		};
	}

	public boolean canManage(UserRole targetRole) {
		return manageableRoles().contains(targetRole);
	}
}
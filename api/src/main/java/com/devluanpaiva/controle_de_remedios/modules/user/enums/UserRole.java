package com.devluanpaiva.controle_de_remedios.modules.user.enums;

import java.util.Set;

public enum UserRole {

	ADMIN,

	MANAGER,

	ASSISTANT,

	PATIENT;

	public Set<UserRole> manageableRoles() {
		return switch (this) {
			case ADMIN -> Set.of(MANAGER, ASSISTANT, PATIENT);
			case MANAGER -> Set.of(ASSISTANT, PATIENT);
			case ASSISTANT -> Set.of();
			case PATIENT -> Set.of();
		};
	}

	public boolean canManage(UserRole targetRole) {
		return manageableRoles().contains(targetRole);
	}
}
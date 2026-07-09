package com.devluanpaiva.controle_de_remedios.modules.user.enums;

import java.util.Set;

public enum UserRole {

	ADMIN,

	MANAGER,

	USER;

	public Set<UserRole> manageableRoles() {
		return switch (this) {
			case ADMIN -> Set.of(MANAGER, USER);
			case MANAGER -> Set.of(USER);
			case USER -> Set.of();
		};
	}

	public boolean canManage(UserRole targetRole) {
		return manageableRoles().contains(targetRole);
	}
}
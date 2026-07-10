package com.devluanpaiva.controle_de_remedios.shared.utils;

public final class CpfMasker {
    private CpfMasker() {
    }

    public static String mask(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }

        return cpf.substring(0, 3) + ".***.***-**";
    }
}

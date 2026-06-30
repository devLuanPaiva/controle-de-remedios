package com.devluanpaiva.controle_de_remedios.modules.users.command;

import java.util.Arrays;
import java.util.Scanner;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminCommand implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!Arrays.asList(args).contains("--create-admin")) {
            return;
        }

        Scanner scanner = new Scanner(System.in);
        System.out.println("===== CRIAÇÃO DO ADMIN =====");

        System.out.print("Digite o nome do admin: ");
        String name = scanner.nextLine();

        System.out.print("Digite o email do admin: ");
        String email = scanner.nextLine();

        if (userRepository.existsByEmail(email)) {
            System.out.println("Erro: Já existe um usuário com esse email.");
            return;
        }

        System.out.print("Digite O CPF do admin: ");
        String cpf = scanner.nextLine();

        if (userRepository.existsByCpf(cpf)) {
            System.out.println("Erro: Já existe um usuário com esse CPF.");
            return;
        }

        System.out.print("Digite a senha do admin: ");
        String password = scanner.nextLine();

        User adminUser = User.builder()
                .name(name)
                .email(email)
                .cpf(cpf)
                .password(passwordEncoder.encode(password))
                .role(UserRole.ADMIN)
                .build();

        userRepository.save(adminUser);

        System.out.println("\nAdmin criado com sucesso!");

        System.exit(0);
    }
}

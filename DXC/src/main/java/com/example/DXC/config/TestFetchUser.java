package com.example.DXC.config;
import com.example.DXC.model.User;
import com.example.DXC.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TestFetchUser {

    @Bean
    public CommandLineRunner testUserFetch(UserRepository userRepository) {
        return args -> {
            String testemail = "lb";

            userRepository.findByEmail(testemail).ifPresentOrElse(
                    user -> {
                        System.out.println(" User found:");
                        System.out.println("Name: " + user.getFirstName());
                        System.out.println("Email: " + user.getEmail());
                        System.out.println("Phone: " + user.getPhoneNumber());
                    },
                    () -> System.out.println(" User not found.")
            );
        };
    }
}

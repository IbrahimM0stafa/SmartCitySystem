package com.example.DXC.service;

import com.example.DXC.model.User;
import com.example.DXC.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PasswordServiceImpl implements PasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService mailService;

    // Simple in-memory OTP store (can be replaced with Redis or DB if needed)
    private final Map<String, String> otpStore = new HashMap<>();

    @Override
    public String initiatePasswordChange(String email, String oldPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(email, otp);

        // Send OTP via email
        mailService.sendOtpEmail(email, otp);

        return "OTP sent to your email.";
    }

    @Override
    public String verifyAndChangePassword(String email, String otp, String newPassword) {
        if (!otpStore.containsKey(email) || !otpStore.get(email).equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpStore.remove(email); // Clean up after successful change

        return "Password changed successfully.";
    }
}

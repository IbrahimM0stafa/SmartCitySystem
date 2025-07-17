package com.example.dxc.service;

import com.example.dxc.model.User;
import com.example.dxc.repository.UserRepository;
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

    private final Map<String, String> otpStore = new HashMap<>();

    private final Random random = new Random();

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

        // ✅ Reused Random instance
        String otp = String.format("%06d", random.nextInt(999999));
        otpStore.put(email, otp);

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

        otpStore.remove(email);

        return "Password changed successfully.";
    }
}

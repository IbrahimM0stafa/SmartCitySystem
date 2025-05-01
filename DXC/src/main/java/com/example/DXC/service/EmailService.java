package com.example.DXC.service;

import org.springframework.scheduling.annotation.Async;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
    @Async
    void sendWelcomeEmail(String to, String name);
}

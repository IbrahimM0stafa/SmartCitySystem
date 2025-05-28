package com.example.DXC.service;

import com.example.DXC.model.Alert;
import org.springframework.scheduling.annotation.Async;

import java.util.List;

public interface EmailService {
    void sendOtpEmail(String to, String otp);

    @Async
    void sendWelcomeEmail(String to, String name);

    @Async
    void sendAlertEmail(Alert alert, String emails);
}

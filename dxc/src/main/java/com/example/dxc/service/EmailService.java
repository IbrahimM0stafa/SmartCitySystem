package com.example.dxc.service;

import com.example.dxc.model.Alert;
import org.springframework.scheduling.annotation.Async;

public interface EmailService {
    void sendOtpEmail(String to, String otp);

    @Async
    void sendWelcomeEmail(String to, String name);

    @Async
    void sendAlertEmail(Alert alert, String emails);
}

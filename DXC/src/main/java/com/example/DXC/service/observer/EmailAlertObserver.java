package com.example.DXC.service.observer;
import com.example.DXC.model.Alert;
import com.example.DXC.model.User;
import com.example.DXC.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailAlertObserver implements AlertObserver {
    private final EmailService emailService;

    @Override
    @Async
    public void notify(Alert alert, User user) {
        emailService.sendAlertEmail(alert, user.getEmail());
    }
}
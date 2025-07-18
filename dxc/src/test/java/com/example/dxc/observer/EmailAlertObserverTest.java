package com.example.dxc.observer;

import com.example.dxc.model.Alert;
import com.example.dxc.model.User;
import com.example.dxc.service.EmailService;
import com.example.dxc.service.observer.EmailAlertObserver;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

class EmailAlertObserverTest {

    @Test
    void testNotifyCallsEmailService() {
        // Arrange
        EmailService emailService = mock(EmailService.class);
        EmailAlertObserver observer = new EmailAlertObserver(emailService);

        Alert alert = new Alert(); // You can mock if needed
        User user = new User();
        user.setEmail("test@example.com");

        // Act
        observer.notify(alert, user);

        // Assert
        verify(emailService, times(1)).sendAlertEmail(alert, "test@example.com");
    }
}

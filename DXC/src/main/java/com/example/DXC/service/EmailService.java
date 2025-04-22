package com.example.DXC.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    @Async
    public void sendWelcomeEmail(String to, String name) {
        String subject = "🎉 Welcome to Smart Iot Platform !";

        String htmlContent = "<!DOCTYPE html>" +
                "<html><head><style>" +
                "  .container { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }" +
                "  .card { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }" +
                "  h2 { color: #333; }" +
                "  p { font-size: 16px; color: #555; }" +
                "</style></head>" +
                "<body><div class='container'>" +
                "  <div class='card'>" +
                "    <h2>Welcome, " + name + " 👋</h2>" +
                "    <p>Thanks for joining <strong>Smart Iot Platform</strong>! We're excited to have you.</p>" +
                "    <p>Let us know if you have any questions.</p>" +
                "    <p style='margin-top: 30px;'>Best regards,<br/>DXC Team</p>" +
                "  </div></div></body></html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = is HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            // Optionally log or rethrow
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}

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
                "  body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                "  .card { background-color: #ffffff; max-width: 600px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.1); }" +
                "  h2 { color: #2c3e50; margin-bottom: 10px; }" +
                "  p { font-size: 16px; color: #555555; line-height: 1.6; }" +
                "  .cta { display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #2e86de; color: #ffffff; text-decoration: none; border-radius: 6px; }" +
                "  .footer { margin-top: 40px; font-size: 13px; color: #999999; }" +
                "</style></head>" +
                "<body><div class='card'>" +
                "  <h2>Welcome aboard, " + name + "! 🎉</h2>" +
                "  <p>We're thrilled to have you with us at <strong>Smart IoT Platform</strong>. Whether you're here to innovate, automate, or explore the power of connected things—you're in great company.</p>" +
                "  <p>Get started by logging into your dashboard and exploring the features built just for you.</p>" +
                "  <a href='https://your-platform-link.com/login' class='cta'>Go to Dashboard</a>" +
                "  <p class='footer'>If you have any questions or need assistance, feel free to reach out to our support team anytime.<br/>" +
                "  <br/>Warm regards,<br/>The DXC Team</p>" +
                "</div></body></html>";


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

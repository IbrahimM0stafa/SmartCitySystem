package com.example.dxc.service;

import com.example.dxc.model.Alert;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your OTP for Password Change - Smart IoT System");

            String htmlContent = "<!DOCTYPE html>" +
                    "<html><head><style>" +
                    "  body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                    "  .card { background-color: #ffffff; max-width: 600px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.1); }" +
                    "  h2 { color: #2c3e50; margin-bottom: 20px; }" +
                    "  p { font-size: 16px; color: #555555; line-height: 1.6; }" +
                    "  .otp { font-size: 24px; font-weight: bold; color: #2e86de; margin: 20px 0; }" +
                    "  .footer { margin-top: 40px; font-size: 13px; color: #999999; text-align: center; }" +
                    "</style></head>" +
                    "<body><div class='card'>" +
                    "  <h2>Verify Your Identity</h2>" +
                    "  <p>Hello,</p>" +
                    "  <p>To proceed with your password change on <strong>Smart IoT Platform</strong>, please use the OTP (One-Time Password) below:</p>" +
                    "  <div class='otp'>" + otp + "</div>" +
                    "  <p>This OTP is valid for a limited time. If you did not request a password change, please ignore this email.</p>" +
                    "  <p>Thank you for keeping your account secure!</p>" +
                    "  <div class='footer'>" +
                    "    &copy; 2025 Smart IoT Platform | All rights reserved." +
                    "  </div>" +
                    "</div></body></html>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }


    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    @Async
    @Override
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
                "  <a href='http://localhost:4200/login' class='cta'>Login To Dashboard</a>" +
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
            logger.error("Failed to send welcome email to {}: {}", to, e.getMessage(), e);
        }
    }
    @Async
    @Override
    public void sendAlertEmail(Alert alert, String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("🚨 Alert Triggered: " + alert.getType());
        message.setText("An alert has been triggered!\n\n"
                + "Metric: " + alert.getMetric() + "\n"
                + "Value: " + alert.getValue() + "\n"
                + "Threshold: " + alert.getThresholdValue() + "\n"
                + "Condition: " + alert.getAlertType() + "\n"
                + "Triggered At: " + alert.getTriggeredAt());

        mailSender.send(message);
    }
}

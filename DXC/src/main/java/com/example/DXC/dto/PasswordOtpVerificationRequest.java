package com.example.DXC.dto;

public class PasswordOtpVerificationRequest {
    private String email;
    private String otp;
    private String newPassword;

    // Required: No-arg constructor
    public PasswordOtpVerificationRequest() {}

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

package com.example.dxc.dto;

public class PasswordOtpVerificationRequest {
    private String email;
    private String otp;
    private String newPassword;

    // Default constructor required for framework deserialization (e.g. Jackson)
    public PasswordOtpVerificationRequest() {
        // Intentionally empty
    }

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

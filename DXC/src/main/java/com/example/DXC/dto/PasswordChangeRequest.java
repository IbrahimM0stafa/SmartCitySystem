package com.example.dxc.dto;

public class PasswordChangeRequest {
    private String email;
    private String oldPassword;

    // Required: No-arg constructor
    public PasswordChangeRequest() {}

    public String getEmail() {
        return email;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }
}

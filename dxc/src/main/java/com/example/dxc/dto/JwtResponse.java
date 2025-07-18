package com.example.dxc.dto;

public class JwtResponse {
    private String token;
    private Long id;
    private String email;

    public JwtResponse(String token, Long id, String email) {
        this.token = token;
        this.id = id;
        this.email = email;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}

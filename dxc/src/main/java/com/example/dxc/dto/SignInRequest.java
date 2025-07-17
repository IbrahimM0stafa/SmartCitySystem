package com.example.dxc.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import javax.xml.transform.Source;

@Data
public class SignInRequest implements Source {
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @Override
    public void setSystemId(String systemId) {

    }

    @Override
    public String getSystemId() {
        return "";
    }
}

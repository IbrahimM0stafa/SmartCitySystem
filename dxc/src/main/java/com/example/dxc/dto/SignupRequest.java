package com.example.dxc.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank (message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Pattern(regexp = "^[^<>]*$", message = "Email must not contain scripts or HTML")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private String phoneNumber;

    private String profilePicture;

    private String gender;

    private Integer age;

}

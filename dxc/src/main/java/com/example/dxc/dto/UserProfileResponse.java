package com.example.dxc.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String firstname;
    private String lastname;
    private String email;
    private String gender;
    private Integer age;
    private String phoneNumber;
}

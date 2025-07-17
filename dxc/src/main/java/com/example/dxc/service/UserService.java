package com.example.dxc.service;

import com.example.dxc.dto.SignupRequest;
import com.example.dxc.dto.UpdateProfileRequest;
import com.example.dxc.dto.UserProfileResponse;
import com.example.dxc.model.User;

public interface UserService {
    User registerUser(SignupRequest request);
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest updateRequest);
}

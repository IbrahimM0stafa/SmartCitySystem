package com.example.DXC.service;

import com.example.DXC.dto.SignupRequest;
import com.example.DXC.dto.SignInRequest;
import com.example.DXC.model.User;

public interface UserService {
    User registerUser(SignupRequest request);
    User loginUser(SignInRequest request);
}

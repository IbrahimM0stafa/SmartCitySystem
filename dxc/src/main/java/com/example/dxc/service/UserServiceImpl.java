package com.example.dxc.service;

import com.example.dxc.dto.SignupRequest;
import com.example.dxc.dto.UpdateProfileRequest;
import com.example.dxc.dto.UserProfileResponse;
import com.example.dxc.model.User;
import com.example.dxc.model.UserDetailsImpl;
import com.example.dxc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;


    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .profilePicture(request.getProfilePicture())
                .gender(request.getGender())
                .age(request.getAge())
                .build();

        User savedUser = userRepository.save(user);

        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFirstName());

        return savedUser;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new UserDetailsImpl(user);
    }

    @Override
    public UserProfileResponse getProfile(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) return null;

        User u = user.get();
        UserProfileResponse response = new UserProfileResponse();
        response.setFirstname(u.getFirstName());
        response.setLastname(u.getLastName());
        response.setEmail(u.getEmail());
        response.setAge(u.getAge());
        response.setGender(u.getGender());
        response.setPhoneNumber(u.getPhoneNumber());

        return response;
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only the fields that are allowed to be updated
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }
        if (updateRequest.getAge() != null) {
            user.setAge(updateRequest.getAge());
        }
        if (updateRequest.getGender() != null) {
            user.setGender(updateRequest.getGender());
        }
        if (updateRequest.getProfilePicture() != null) {
            user.setProfilePicture(updateRequest.getProfilePicture());
        }

        User updatedUser = userRepository.save(user);

        // Convert to response DTO
        UserProfileResponse response = new UserProfileResponse();
        response.setFirstname(updatedUser.getFirstName());
        response.setLastname(updatedUser.getLastName());
        response.setEmail(updatedUser.getEmail());
        response.setAge(updatedUser.getAge());
        response.setGender(updatedUser.getGender());
        response.setPhoneNumber(updatedUser.getPhoneNumber());

        return response;
    }
}

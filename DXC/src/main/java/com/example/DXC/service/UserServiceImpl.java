package com.example.DXC.service;

import com.example.DXC.dto.SignupRequest;
import com.example.DXC.dto.UserProfileResponse;
import com.example.DXC.model.User;
import com.example.DXC.model.UserDetailsImpl;
import com.example.DXC.repository.UserRepository;
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

        return response;
    }

    //    @Override
//    public User loginUser(SignInRequest request) {
//        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
//
//        if (userOptional.isEmpty()) {
//            throw new RuntimeException("Invalid email or password");
//        }
//
//        User user = userOptional.get();
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid email or password");
//        }
//
//        return user;
//    }
}
package com.example.dxc.jwt;

import com.example.dxc.model.User;
import com.example.dxc.repository.UserRepository;
import com.example.dxc.service.CustomOAuth2User;
import java.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getEmail();


        // Generate JWT
        String token = jwtUtils.generateJwtTokenWithEmail(email);

        // Send JWT in redirect URL or cookie (Here: redirect with token)
        String redirectURL = "http://localhost:4200/oauth2/redirect?token=" + token; // Change to your frontend URL

        getRedirectStrategy().sendRedirect(request, response, redirectURL);
    }
}


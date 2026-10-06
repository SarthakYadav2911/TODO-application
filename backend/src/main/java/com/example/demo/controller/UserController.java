package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {

        User user = userRepository.findByEmail(loginUser.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        if (!passwordEncoder.matches(
                loginUser.getPassword(),
                user.getPassword())) {

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {

        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
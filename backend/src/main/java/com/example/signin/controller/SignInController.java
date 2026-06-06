package com.example.signin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class SignInController {

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "");
        String password = credentials.getOrDefault("password", "");

        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("message", "Inicio de sesión simulado exitoso");
        response.put("success", !email.isEmpty() && !password.isEmpty());

        return ResponseEntity.ok(response);
    }
}

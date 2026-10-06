package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Sarthak's World";
    }

    @GetMapping("/todo/search")
    public String searchTodo(@RequestParam String title) {
        return "Searching for: " + title;
    }

    @GetMapping("/todo/{id}")
    public String getTodo(@PathVariable Long id) {
        return "Todo id: " + id;
    }
}
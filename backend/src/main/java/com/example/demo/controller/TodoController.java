
package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.TodoRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoController(
            TodoRepository todoRepository,
            UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    // Find the user authenticated through the current session
    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        return userRepository.findByEmail(authentication.getName())
                .orElse(null);
    }

    // Return safe task details without exposing the associated User entity
    private Map<String, Object> toResponse(Todo todo) {
        return Map.of(
                "id", todo.getId(),
                "title", todo.getTitle(),
                "completed", todo.isCompleted()
        );
    }

    // Get only the logged-in user's tasks
    @GetMapping
    public ResponseEntity<?> getUserTodos(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Please log in"));
        }

        List<Map<String, Object>> todos =
                todoRepository.findByUser(user)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(todos);
    }

    // Create a task for the logged-in user
    @PostMapping
    public ResponseEntity<?> addTodo(
            Authentication authentication,
            @RequestBody Todo todo) {

        User user = getCurrentUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Please log in"));
        }

        if (todo.getTitle() == null || todo.getTitle().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Task title is required"));
        }

        // Never trust a user ID supplied by the client
        todo.setUser(user);

        Todo savedTodo = todoRepository.save(todo);

        return ResponseEntity.ok(toResponse(savedTodo));
    }

    // Update a task only if it belongs to the logged-in user
    @PutMapping("/{todoId}")
    public ResponseEntity<?> updateTodo(
            @PathVariable Long todoId,
            Authentication authentication,
            @RequestBody Todo updatedTodo) {

        User user = getCurrentUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Please log in"));
        }

        Todo todo = todoRepository
                .findByIdAndUser(todoId, user)
                .orElse(null);

        if (todo == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedTodo.getTitle() == null
                || updatedTodo.getTitle().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Task title is required"));
        }

        todo.setTitle(updatedTodo.getTitle());
        todo.setCompleted(updatedTodo.isCompleted());

        Todo savedTodo = todoRepository.save(todo);

        return ResponseEntity.ok(toResponse(savedTodo));
    }

    // Delete a task only if it belongs to the logged-in user
    @DeleteMapping("/{todoId}")
    public ResponseEntity<?> deleteTodo(
            @PathVariable Long todoId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Please log in"));
        }

        Todo todo = todoRepository
                .findByIdAndUser(todoId, user)
                .orElse(null);

        if (todo == null) {
            return ResponseEntity.notFound().build();
        }

        todoRepository.delete(todo);

        return ResponseEntity.ok(
                Map.of("message", "Todo deleted")
        );
    }
}

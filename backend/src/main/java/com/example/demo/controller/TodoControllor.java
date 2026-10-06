package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.TodoRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:5173")
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoController(
            TodoRepository todoRepository,
            UserRepository userRepository) {

        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    // Get all todos belonging to a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTodos(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                todoRepository.findByUser(user)
        );
    }

    // Add a todo for a user
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> addTodo(
            @PathVariable Long userId,
            @RequestBody Todo todo) {

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        todo.setUser(user);

        Todo savedTodo = todoRepository.save(todo);

        return ResponseEntity.ok(savedTodo);
    }

    // Delete a todo
    @DeleteMapping("/{todoId}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long todoId) {

        if (!todoRepository.existsById(todoId)) {
            return ResponseEntity.notFound().build();
        }

        todoRepository.deleteById(todoId);

        return ResponseEntity.ok("Todo deleted");
    }

    // Mark todo as completed/uncompleted
    @PutMapping("/{todoId}")
    public ResponseEntity<?> updateTodo(
            @PathVariable Long todoId,
            @RequestBody Todo updatedTodo) {

        Todo todo = todoRepository.findById(todoId)
                .orElse(null);

        if (todo == null) {
            return ResponseEntity.notFound().build();
        }

        todo.setTitle(updatedTodo.getTitle());
        todo.setCompleted(updatedTodo.isCompleted());

        Todo savedTodo = todoRepository.save(todo);

        return ResponseEntity.ok(savedTodo);
    }
}
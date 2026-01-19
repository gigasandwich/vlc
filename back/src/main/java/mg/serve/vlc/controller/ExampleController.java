package mg.serve.vlc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import mg.serve.vlc.controller.response.ApiResponse;
import mg.serve.vlc.model.Example;

import java.util.*;

@RestController
class ExampleController {
    @GetMapping("/")
    ResponseEntity<Map<String, Object>> index() {
        Map<String, Object> data = new HashMap<>();
        
        data.put("key1", "value1");
        
        data.put("key2", "value2");

        data.put("key3", "value3");
        
        // Normally unnecessary but needed to prove that models can initiate connections (with Spring Boot)
        List<Example> all = new Example().listAll();
        data.put("examples-list", all);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/some-endpoint")
    ResponseEntity<List<Example>> someEndpoint() {
        List<Example> all = new Example().listAll();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/protected-endpoint")
    ResponseEntity<ApiResponse> anotherEndpoint() {
        ApiResponse response = new ApiResponse("success", "You have accessed a protected endpoint", null);
        return ResponseEntity.ok(response);
    }
}
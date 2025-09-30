package com.emailAssist.emailAssist.controller;

import com.emailAssist.emailAssist.EmailRequest;
import com.emailAssist.emailAssist.service.EmailRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EmailGeneratorController {

    @Autowired
    private EmailRequestService emailRequestService;

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateResponse(@RequestBody EmailRequest request) {
        System.out.println("   \n sending request     ");
        String response = emailRequestService.generateEmailReply(request);
        return ResponseEntity.ok(response);
    }
}
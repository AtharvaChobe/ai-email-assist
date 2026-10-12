package com.emailAssist.emailAssist.service;

import com.emailAssist.emailAssist.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailRequestService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;

    public EmailRequestService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest request) {
        String prompt = buildPrompt(request);
//        System.out.println("prompt: " + prompt);

        Map<String, Object> content = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            ObjectMapper mapper = new ObjectMapper();
//            System.out.println("Sending JSON: " + mapper.writeValueAsString(content));

            String response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(content)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse ->
                                    clientResponse.bodyToMono(String.class).map(errorBody -> {
//                                System.out.println("Error response from Gemini: " + errorBody);
                                        return new RuntimeException("API error: " + errorBody);
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

//            System.out.println("Response: " + response);

            return extractData(response);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String extractData(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "error parsing response: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate an email reply. ");
        String tone = request.getTone();
        if ("formal".equalsIgnoreCase(tone)) {
            prompt.append("Use a formal, professional tone. ");
        } else if ("casual".equalsIgnoreCase(tone)) {
            prompt.append("Use a casual, friendly tone. ");
        } else {
            prompt.append("Use a professional tone. ");
        }

        String length = request.getLength();
        if ("short".equalsIgnoreCase(length)) {
            prompt.append("Keep the reply concise, around 1-3 sentences. ");
        } else if ("detailed".equalsIgnoreCase(length)) {
            prompt.append("Write a detailed reply that addresses the important points. ");
        } else {
            prompt.append("Use a moderate length. ");
        }
        prompt.append("Do not include a subject line or introductory commentary. ");
        prompt.append("Original email: ").append(request.getContent());
        return prompt.toString();
    }
}

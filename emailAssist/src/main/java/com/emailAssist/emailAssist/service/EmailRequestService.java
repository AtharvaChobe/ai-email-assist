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

    public String generateEmailReply(EmailRequest request){
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
        prompt.append("Generate a professional email reply for the following email, please dont generate subject line ");
        if(request.getTone() != null){
            prompt.append("use a "+request.getTone() + " tone ");
        }
        prompt.append("Original email: " + request.getContent());
        return prompt.toString();
    }
}

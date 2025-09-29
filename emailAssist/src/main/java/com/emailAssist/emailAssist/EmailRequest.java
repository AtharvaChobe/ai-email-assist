package com.emailAssist.emailAssist;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data

public class EmailRequest {
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    private String tone;
}

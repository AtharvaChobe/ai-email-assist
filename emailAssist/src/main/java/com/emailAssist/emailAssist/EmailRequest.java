package com.emailAssist.emailAssist;

import lombok.Data;

@Data
public class EmailRequest {

    private String content;
    private String tone;
    private String length;

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

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

}

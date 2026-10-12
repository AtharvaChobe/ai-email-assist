console.log("Gmail AI content script loaded");

if (!document.getElementById("ai-reply-btn")) {
    const btn = document.createElement("button");
    btn.id = "ai-reply-btn";
    btn.innerText = "AI Assist";
    Object.assign(btn.style, {
        position: "fixed",
        right: "45px",
        bottom: "20px",
        zIndex: "9999",
        padding: "11px 16px",
        background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
        color: "white",
        border: "none",
        borderRadius: "11px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        display: "none",
        boxShadow: "4px 4px 16px grey"
    });

    const panel = document.createElement("div");
    panel.id = "ai-reply-options";
    Object.assign(panel.style, {
        position: "fixed",
        right: "45px",
        bottom: "75px",
        zIndex: "9999",
        width: "250px",
        padding: "18px",
        background: "#ffffff",
        color: "#1f2937",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        display: "none",
        boxSizing: "border-box"
    });
    panel.innerHTML = `
        <div style="font-size:17px;font-weight:700;margin-bottom:16px;">
            AI Reply Settings
        </div>
        <label for="ai-tone"
            style="display:block;font-weight:600;margin-bottom:7px;">
            Reply tone
        </label>
        <select id="ai-tone"
            style="width:100%;padding:9px;margin-bottom:16px;
            border:1px solid #d1d5db;border-radius:7px;
            background:white;color:#111827;">
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
        </select>
        <label for="ai-length"
            style="display:block;font-weight:600;margin-bottom:7px;">
            Email length
        </label>
        <select id="ai-length"
            style="width:100%;padding:9px;margin-bottom:18px;
            border:1px solid #d1d5db;border-radius:7px;
            background:white;color:#111827;">
            <option value="short">Short</option>
            <option value="detailed">Detailed</option>
        </select>
        <button id="ai-generate-btn"
            style="width:100%;padding:11px;background:#4f46e5;
            color:white;border:none;border-radius:8px;
            font-weight:600;cursor:pointer;">
            Generate Reply
        </button>
        <button id="ai-cancel-btn"
            style="width:100%;padding:9px;margin-top:7px;
            background:#f3f4f6;color:#374151;border:none;
            border-radius:8px;cursor:pointer;">
            Cancel
        </button>
    `;
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    const toneSelect = panel.querySelector("#ai-tone");
    const lengthSelect = panel.querySelector("#ai-length");
    const generateBtn = panel.querySelector("#ai-generate-btn");
    const cancelBtn = panel.querySelector("#ai-cancel-btn");

    btn.addEventListener("click", () => {
        if (btn.disabled) return;
        const isOpen = panel.style.display === "block";
        panel.style.display = isOpen ? "none" : "block";
    });
    cancelBtn.addEventListener("click", () => {
        panel.style.display = "none";
    });
    generateBtn.addEventListener("click", async () => {
        const emailDiv = document.querySelector("div.a3s.aiL");
        if (!emailDiv) {
            alert("Could not find email content!");
            return;
        }
        const content = emailDiv.innerText.trim();
        if (!content) {
            alert("The email content is empty.");
            return;
        }
        const tone = toneSelect.value;
        const length = lengthSelect.value;
        const originalBtnText = btn.innerText;
        btn.innerText = "Generating...";
        btn.disabled = true;
        generateBtn.innerText = "Generating...";
        generateBtn.disabled = true;
        panel.style.display = "none";

        btn.style.opacity = "0.7";
        btn.style.cursor = "wait";

        try {
            const response = await fetch(
                "https://ai-email-assist.onrender.com/api/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: content,
                        tone: tone,
                        length: length
                    })
                }
            );

            const reply = await response.text();

            if (!response.ok) {
                throw new Error(
                    `Backend returned ${response.status}: ${reply}`
                );
            }
            if (!reply.trim() || reply.trim().startsWith("Error:")) {
                throw new Error(reply || "The backend returned an empty reply.");
            }
            const replyBox = document.querySelector(
                'div[contenteditable="true"].Am.aiL.aO9.Al.editable.LW-avf.tS-tW'
            );
            if (!replyBox) {
                alert(
                    "Reply generated, but Gmail's reply box was not found. " +
                    "Open a reply composer and try again."
                );
                return;
            }
            replyBox.focus();
            replyBox.innerText = reply;

            replyBox.dispatchEvent(
                new InputEvent("input", {
                    bubbles: true,
                    inputType: "insertText",
                    data: reply
                })
            );
            alert("AI reply inserted!");
        } catch (error) {
            console.error("Error generating reply:", error);
            alert("Failed to generate reply. Pls try again later");
        } finally {
            btn.innerText = originalBtnText;
            btn.disabled = false;
            generateBtn.innerText = "Generate Reply";
            generateBtn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
    });

    const observer = new MutationObserver(() => {
        const emailDiv = document.querySelector("div.a3s.aiL");
        btn.style.display = emailDiv ? "block" : "none";
        if (!emailDiv) {
            panel.style.display = "none";
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (document.querySelector("div.a3s.aiL")) {
        btn.style.display = "block";
    }
}
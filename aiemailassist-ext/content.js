console.log("Gmail AI content script loaded");

if (!document.getElementById("ai-reply-btn")) {
    const btn = document.createElement("button");
    btn.id = "ai-reply-btn";
    btn.innerText = "AI Assist";
    btn.style.position = "fixed";
    btn.style.right = "45px";
    btn.style.bottom = "20px";
    btn.style.zIndex = "9999";
    btn.style.padding = "11px 11px";
    btn.style.background = "linear-gradient(90deg, #4f46e5, #3b82f6)";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "11px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.display = "none";
    btn.style.boxShadow = "4px 4px 16px grey";

    btn.onclick = () => {
        const emailDiv = document.querySelector('div.a3s.aiL');
        if (emailDiv) {
            const content = emailDiv.innerText;
            console.log("Original email content:", content);
            btn.innerText = "Generating..."
            fetch("https://ai-email-assist.onrender.com/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, tone: "formal" })
            })
                .then(res => res.text())
                .then(reply => {
                    // console.log("AI Reply:", reply);

                    const replyBox = document.querySelector('div[contenteditable="true"].Am.aiL.aO9.Al.editable.LW-avf.tS-tW');
                    if (replyBox) {
                        replyBox.focus();
                        replyBox.innerText = reply;
                        alert("AI Reply inserted!");
                    } else {
                        alert("Could not find Gmail reply box!");
                    }
                })
                .catch(err => {
                    console.error("Error calling backend:", err);
                    alert("Failed to get AI reply");
                });
            btn.innerText = "AI Assist";
        } else {
            alert("Could not find email content!");
        }
    };
    document.body.appendChild(btn);

    const observer = new MutationObserver(() => {
        const emailDiv = document.querySelector('div.a3s.aiL');
        if (emailDiv) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}
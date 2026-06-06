const chat = document.getElementById("chat");

// Load old chat history
window.onload = async () => {
  try {
    const response = await fetch("/history");
    const messages = await response.json();

    messages.forEach((msg) => {
      if (msg.role === "user") {
        chat.innerHTML += `
          <div class="user">
            ${msg.content}
          </div>
        `;
      }

      if (msg.role === "ai") {
        chat.innerHTML += `
          <div class="ai">
            ${msg.content}
          </div>
        `;
      }
    });

    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    console.error("History load failed", error);
  }
};

// Send message
async function sendMessage() {
  const input = document.getElementById("message");

  const userMessage = input.value.trim();

  if (!userMessage) return;

  chat.innerHTML += `
    <div class="user">
      ${userMessage}
    </div>
  `;

  input.value = "";

  chat.innerHTML += `
    <div id="typing" class="typing">
      Thinking...
    </div>
  `;

  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    const data = await response.json();

    const typing = document.getElementById("typing");

    if (typing) {
      typing.remove();
    }

    chat.innerHTML += `
      <div class="ai">
        ${data.reply}
      </div>
    `;

    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    console.error(error);

    const typing = document.getElementById("typing");

    if (typing) {
      typing.remove();
    }

    chat.innerHTML += `
      <div class="ai">
        Error talking to AI
      </div>
    `;
  }
}

// Enter to send
document
  .getElementById("message")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

// Temporary New Chat button
document
  .querySelector(".new-chat")
  .addEventListener("click", () => {
    chat.innerHTML = "";
  });
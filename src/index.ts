export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // If it's a GET request with a prompt in the URL path, generate the image
    if (url.pathname.startsWith("/generate")) {
      const promptFromPath = decodeURIComponent(url.searchParams.get("prompt") || "cyberpunk panda");

      const inputs = { prompt: promptFromPath };

      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs,
      );

      return new Response(response, {
        headers: {
          "content-type": "image/png",
        },
      });
    }

    // Otherwise, serve the HTML UI
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Image Generator</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; text-align: center; background: #1a1a1a; color: white; }
          input, button { padding: 0.5rem; font-size: 1rem; margin-top: 1rem; }
          img { margin-top: 2rem; max-width: 100%; border: 1px solid #333; }
        </style>
      </head>
      <body>
        <h1>🧠 AI Image Generator</h1>
        <form id="prompt-form">
          <input type="text" id="prompt-input" placeholder="Enter your prompt" size="40" required />
          <br />
          <button type="submit">Generate</button>
        </form>
        <div id="image-container"></div>

        <script>
          const form = document.getElementById("prompt-form");
          const input = document.getElementById("prompt-input");
          const container = document.getElementById("image-container");

          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const prompt = encodeURIComponent(input.value);
            container.innerHTML = "<p>Generating image...</p>";
            const img = new Image();
            img.src = "/generate?prompt=" + prompt;
            img.onload = () => {
              container.innerHTML = "";
              container.appendChild(img);
            };
            img.onerror = () => {
              container.innerHTML = "<p>Failed to generate image.</p>";
            };
          });
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=UTF-8",
      },
    });
  },
} satisfies ExportedHandler<Env>;

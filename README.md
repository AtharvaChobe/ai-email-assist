# AI Gmail Assistant

A Chrome extension that helps Gmail users draft email replies with AI.
The extension reads the currently opened email, sends its content and
reply preferences to a Spring Boot backend, and inserts the generated
reply into Gmail.

> **Privacy note:** Email content submitted for generation is sent to
> the configured backend and then to the Google Gemini API. Do not use
> this project with sensitive emails unless you understand and accept
> the data handling involved. Never commit API keys or other secrets.

## Features

-   Integrates with Gmail through a Chrome extension content script.
-   Generates email replies using the Google Gemini API.
-   Supports reply tone selection: **Formal** or **Casual**.
-   Supports reply length selection: **Short** or **Detailed**.
-   Inserts generated text into Gmail's reply editor.
-   Spring Boot REST API for reply generation.
-   Dockerized backend suitable for deployment to a container host such
    as Render.
-   Lightweight health endpoint at `/api/ping`.

The extension UI and backend must both support the `tone` and `length`
fields for the preference controls to work end to end.

## Architecture

``` text
Gmail page
   |
   v
Chrome extension (content.js)
   |  POST /api/generate
   v
Spring Boot backend
   |
   v
Google Gemini API
   |
   v
Generated reply returned to the extension
   |
   v
Reply inserted into Gmail
```

## Technology stack

-   **Backend:** Java, Spring Boot, Spring WebFlux `WebClient`
-   **AI provider:** Google Gemini API
-   **Browser integration:** Chrome Extension APIs, JavaScript
-   **Containerization:** Docker
-   **Deployment:** Render (or another container hosting provider)

## Repository layout

Adapt these paths to match your actual repository. A typical layout is:

``` text
ai-gmail-assistant/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── ...
└── extension/
    ├── manifest.json
    ├── content.js
    ├── background.js       # if using a service worker for API requests
    └── ...
```

If the backend and extension are stored in separate repositories, keep
the relevant README sections with each repository or adapt the paths
below.

## Prerequisites

-   JDK version compatible with your Spring Boot project (the Dockerfile
    used for this project has used Java 21).
-   Maven.
-   Docker Desktop or Docker Engine.
-   A Google Gemini API key.
-   Google Chrome for testing the extension.

## Configure the backend

Example `application.properties`:

``` properties
gemini.api.key=${GEMINI_API}
gemini.api.url=${GEMINI_API_URL}
```

Set these environment variables in your local environment or hosting
provider:

``` text
GEMINI_API=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/YOUR_AVAILABLE_MODEL:generateContent
```

Use a model ID currently available to your Gemini API project. Model
availability can change, so verify the model name in Google's current
Gemini API documentation before deploying. Do not include `?key=...` in
`GEMINI_API_URL` if your Java code already appends `?key=`.

### Run locally

From the backend directory containing `pom.xml`:

``` bash
mvn clean package -DskipTests
```

Then run the built JAR, replacing the filename with the actual file
generated in `target/`:

``` bash
java -jar target/your-generated-application.jar
```

Make sure the required environment variables are set before starting the
application.

## API endpoints

### `GET /api/ping`

Lightweight health check. Expected response:

``` text
ok
```

Test locally:

``` bash
curl http://localhost:8080/api/ping
```

### `POST /api/generate`

Generates an email reply. The extension request body is:

``` json
{
  "content": "The original email text goes here.",
  "tone": "formal",
  "length": "short"
}
```

Supported preference values in the extension UI:

-   `tone`: `formal` or `casual`
-   `length`: `short` or `detailed`

Example using curl:

``` bash
curl -X POST "http://localhost:8080/api/generate" -H "Content-Type: application/json" -d "{\"content\":\"Could you share an update on the project?\",\"tone\":\"formal\",\"length\":\"short\"}"
```

The backend DTO and prompt-building logic must include the `length`
field. Validate input values and return meaningful HTTP status codes for
invalid requests or upstream AI-provider errors.

## Load the Chrome extension locally

1.  Open `chrome://extensions` in Chrome.
2.  Enable **Developer mode**.
3.  Select **Load unpacked**.
4.  Choose the extension directory containing `manifest.json`.
5.  Open or refresh Gmail and test the extension.

After changing extension files, return to `chrome://extensions`, click
**Reload** for the extension, and refresh Gmail.

### Backend URL

The extension's request URL must match the environment you are testing:

-   Local backend: `http://localhost:8080/api/generate`
-   Deployed backend:
    `https://YOUR-RENDER-SERVICE.onrender.com/api/generate`

A request from Gmail directly to `localhost` can be blocked by Chrome's
local-network security protections. For local development, consider
sending the request from the extension's background service worker and
configure the necessary host permissions. The backend must also have
suitable CORS settings where applicable. For deployed use, use the HTTPS
backend URL.

## Build the Docker image

Run these commands from the backend directory containing the
`Dockerfile`:

``` bash
mvn clean package -DskipTests
docker build -t YOUR_DOCKERHUB_USERNAME/ai-email-assist:v1 .
```

Ensure the JAR filename in the Dockerfile matches the file generated
under `target/`. For example:

``` dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/ai-email-assist-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

The exact JAR must exist before running `docker build`.

Test the image locally, passing the required environment variables:

``` bash
docker run --rm -p 8080:8080 -e GEMINI_API="your_gemini_api_key" -e GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/YOUR_AVAILABLE_MODEL:generateContent" YOUR_DOCKERHUB_USERNAME/ai-email-assist:v1
```

## Push the image to Docker Hub

``` bash
docker login
docker push YOUR_DOCKERHUB_USERNAME/ai-email-assist:v1
```

Replace the placeholder with your Docker Hub username. Use a new version
tag for each release (for example, `v2`, `v3`) to make deployments
easier to track.

## Deploy or update on Render

1.  Build and push the updated Docker image to Docker Hub.
2.  In the Render dashboard, open the backend service.
3.  Configure the service to use the intended image tag.
4.  Set `GEMINI_API` and `GEMINI_API_URL` as environment variables in
    Render.
5.  Deploy the new image.
6.  Check deployment logs for startup errors.
7.  Test `/api/ping`, then test `/api/generate`.

Pushing an image to Docker Hub does not by itself guarantee that Render
will deploy the new tag.

## Troubleshooting

### Gemini returns `404 NOT_FOUND` for a model

The configured model may have been retired or may not be available to
your API project. Check the current Gemini API model list, update
`GEMINI_API_URL`, and redeploy the backend. A successful `/api/ping`
does not confirm that Gemini generation works.

### `API key not valid`

Check that `GEMINI_API` contains a valid key and that the backend reads
the correct environment variable. Ensure the URL and key are not
accidentally combined or appended twice.

### CORS or localhost / loopback error

Gmail is hosted at `https://mail.google.com`, while `localhost` refers
to the user's own computer. Chrome may block requests from the Gmail
page to local services. Use the deployed HTTPS backend for normal
testing, or route local requests through the extension background
service worker with appropriate permissions. Configure Spring Boot CORS
as needed.

### Docker build says the JAR was not found

Run `mvn clean package -DskipTests`, inspect the `target/` directory,
and make sure the `COPY` path in the Dockerfile matches the exact JAR
filename.

### Render appears to run an older version

Check the image tag configured in Render. Prefer explicit version tags
over repeatedly overwriting `latest`, and redeploy after updating the
configured tag.

### The reply length does not change

Confirm that: 1. The extension sends `length` in the JSON request. 2.
`EmailRequest` has a `length` field and accessor. 3. `buildPrompt()`
uses the selected length. 4. The updated backend image is actually
deployed.

## Security and privacy checklist

-   Keep the Gemini API key in environment variables or a secrets
    manager.
-   Never place API keys in `content.js`, `manifest.json`, Git, or the
    Docker image.
-   Avoid logging full email bodies or generated replies.
-   Disclose that email content is sent to your backend and the Gemini
    API.
-   Request only the Chrome extension permissions needed by the project.
-   Validate input and handle provider errors without exposing secrets.
-   Do not treat CORS as authentication; it is not a replacement for API
    access controls.

## Future improvements

-   Preview a generated reply before inserting it.
-   Add regenerate and copy actions.
-   Remember the user's preferred tone and length.
-   Add better retry handling, request timeouts, and rate limiting.
-   Add automated tests for request validation and upstream error
    handling.
-   Consider migrating to a currently recommended Gemini API interface
    after basic generation is stable.

## License

Add a license before distributing or accepting contributions. If no
license has been chosen, the project is not automatically open for reuse
just because its source code is public.

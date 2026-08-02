# 📸 SmartFarm AI — Week 7 AI Integration Screenshot Guide

This guide provides exact steps for taking required submission screenshots for Week 7 (Google Gemini AI Assistant & Prompt Engineering).

---

## Required Screenshots Overview

| Screenshot Name | Page / Endpoint | Key Visual Elements to Capture |
| :--- | :--- | :--- |
| `01_ai_assistant_interface.png` | AI Assistant (`/chat`) | Full glassmorphic chat interface, initial welcome prompt, input box. |
| `02_disease_explanation_chat.png` | AI Assistant (`/chat`) | Query: *"How do I treat early blight in potato?"* showing Gemini markdown response. |
| `03_mandi_prices_chat.png` | AI Assistant (`/chat`) | Query: *"What is the mandi price of wheat?"* showing structured price ranges. |
| `04_voice_recording_active.png` | AI Assistant (`/chat`) | Pulsing red recording button & active voice capture waveform. |
| `05_gemini_api_network.png` | DevTools > Network | `POST /api/ai/chat` request payload & 200 OK JSON response containing AI text. |
| `06_postman_ai_chat.png` | Postman Application | Execution of `POST /api/ai/chat` in Postman with `{"prompt": "..."}` payload. |
| `07_gemini_api_key_env.png` | `.env` / Config | `backend/.env` file showing `GEMINI_API_KEY` configuration. |

---

## Step-by-Step Instructions

### Screenshot 1: AI Assistant Interface
1. Log into SmartFarm AI and navigate to **AI Assistant** (`http://localhost:5173/chat`).
2. Capture the UI showing the glassmorphic card, header badge *"Generative AI Copilot"*, voice toggle icon, and text input box.

### Screenshot 2: Disease Explanation & Treatment Response
1. In the chat input, type: *"How do I identify and treat early blight in my potato crop?"*
2. Press **Send**.
3. Capture the formatted Gemini response displaying bold subheaders for Symptoms, Biological Treatment, and Chemical Control.

### Screenshot 3: Market & Mandi Price Advice Response
1. In the chat input, type: *"What is today's mandi rate for wheat and paddy?"*
2. Press **Send**.
3. Capture the output showing commodity prices formatted in bullet points.

### Screenshot 4: Voice Chat Recording Mode
1. Click the Microphone icon next to the input box.
2. Grant microphone permissions if prompted.
3. Capture the pulsing red recording indicator and green audio wave banner showing *"Voice capture active... Speak now"*.

### Screenshot 5: DevTools Network Request Verification
1. Open DevTools (`F12`), switch to the **Network** tab.
2. Filter by `chat`.
3. Send a message in the chat UI.
4. Click on the `chat` request in the Network tab.
5. Capture the **Headers**, **Payload**, and **Response** tabs proving live backend API execution.

### Screenshot 6: Postman AI Endpoint Verification
1. Open Postman.
2. Select `POST http://localhost:8000/api/ai/chat`.
3. Body (`raw JSON`):
   ```json
   {
     "prompt": "What crop is recommended for clay soil with high rainfall?"
   }
   ```
4. Click **Send**.
5. Capture the `200 OK` status and the JSON response object containing `message`, `sender`, `created_at`.

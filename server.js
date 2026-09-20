const express = require('express');
const { google } = require('google-genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Gemini AI client
// It will automatically read process.env.GEMINI_API_KEY
const ai = google.genai();

// Twilio sends data as URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Main webhook endpoint for Twilio
app.post('/sms-webhook', async (req, res) => {
    const incomingText = req.body.Body;
    const senderNumber = req.body.From;

    console.log(`Received message from ${senderNumber}: "${incomingText}"`);

    try {
        // Pass the user's text message to the Gemini AI model
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: incomingText,
        });

        const replyMessage = aiResponse.text;

        // Respond to Twilio with TwiML XML markup to trigger an immediate reply SMS
        res.type('text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyMessage}</Message>
</Response>`);
            
    } catch (error) {
        console.error('Error communicating with Gemini AI:', error);
        
        // Fail-safe graceful text response if the API call experiences an issue
        res.type('text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Sorry, my AI engine encountered an error. Please try texting again in a minute!</Message>
</Response>`);
    }
});

app.listen(PORT, () => {
    console.log(`AI SMS Chatbot listening on port ${PORT}`);
});

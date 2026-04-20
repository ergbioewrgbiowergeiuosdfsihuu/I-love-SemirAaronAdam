const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve the frontend UI from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 2. The Hidden Processing Server (Logic Node)
app.get('/process', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).send("Error: No URL provided");
    }

    try {
        // Fetch the target website using the backend
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Load the HTML into Cheerio
        const $ = cheerio.load(response.data);
        
        // Strip out all scripts, styles, images, and iframes to prevent leaks/tracking
        $('script, style, noscript, img, iframe, svg, video, audio').remove();
        
        // Extract only the text content
        const textContent = $('body').text()
            .replace(/\s\s+/g, '\n') // Clean up excessive whitespace
            .trim();

        // Send back strictly Plaintext
        res.setHeader('Content-Type', 'text/plain');
        res.send(textContent);

    } catch (err) {
        console.error("Backend Processing Error:", err.message);
        res.status(500).send(`Server Error: Unable to fetch or process ${targetUrl}`);
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Chain Server running on port ${PORT}`);
});

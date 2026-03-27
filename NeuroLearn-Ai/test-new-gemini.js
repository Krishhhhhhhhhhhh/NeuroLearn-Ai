async function testNewGeminiAPI() {
  const apiKey = "AIzaSyD48W1OlXUYec_Fw9hxmq3TUuF_o11CCLg";
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  console.log('Testing new Gemini API key...');

  try {
    const response = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "hello world" in one word'
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ New API Key Error:', data.error);
    } else if (data.candidates && data.candidates.length > 0) {
      console.log('✅ New API Key Success!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('⚠️  API OK but unexpected response format');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testNewGeminiAPI();

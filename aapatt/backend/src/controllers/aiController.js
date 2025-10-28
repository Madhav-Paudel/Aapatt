import axios from 'axios';

export async function analyzeInjury(req, res) {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    const modelUrl = process.env.HUGGING_FACE_MODEL_URL;
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    const bytes = Buffer.from(imageBase64, 'base64');
    const { data } = await axios.post(modelUrl, bytes, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/octet-stream' }
    });
    return res.json({ inference: data });
  } catch (e) {
    return res.status(500).json({ error: 'AI analysis failed' });
  }
}

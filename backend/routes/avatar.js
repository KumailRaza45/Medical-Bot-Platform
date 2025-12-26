const express = require('express');
const { generateSpeech } = require('../services/aiAvatar');

const router = express.Router();

/**
 * Helper function to detect language from text
 */
function detectLanguage(text) {
  // Check for Arabic script
  if (/[\u0600-\u06FF]/.test(text)) {
    // Distinguish between Arabic and Urdu based on character frequency
    const arabicChars = (text.match(/[\u0621-\u063A\u0641-\u064A]/g) || []).length;
    const urduChars = (text.match(/[\u0679\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BA\u06BE\u06CC]/g) || []).length;
    return urduChars > arabicChars ? 'ur' : 'ar';
  }
  
  // Check for Chinese characters
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh';
  }
  
  // Check for French characters (accented)
  if (/[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/.test(text)) {
    return 'fr';
  }
  
  // Check for Spanish characters
  if (/[áéíóúñüÁÉÍÓÚÑÜ¿¡]/.test(text)) {
    return 'es';
  }
  
  // Check for German characters
  if (/[äöüßÄÖÜ]/.test(text)) {
    return 'de';
  }
  
  // Default to English
  return 'en';
}

/**
 * POST /api/avatar/speak
 * Generate speech audio only (no video generation)
 * Body: { text: string, language?: string }
 * Returns: { success: boolean, audioUrl: string, language: string }
 */
router.post('/speak', async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }

    // Auto-detect language if not provided
    const detectedLang = language || detectLanguage(text);

    // Skip Roman Urdu/Arabic (Latin script in Urdu/Arabic mode)
    if ((detectedLang === 'ur' || detectedLang === 'ar') && !/[\u0600-\u06FF]/.test(text)) {
      return res.json({ 
        success: false, 
        textOnly: true,
        message: 'Roman script - text display only' 
      });
    }

    console.log(`[Avatar] Generating speech for: "${text.substring(0, 50)}..." (${detectedLang})`);

    // Generate speech with ElevenLabs and upload to Supabase
    const audioUrl = await generateSpeech(text, detectedLang);
    console.log(`[Avatar] Audio generated and uploaded: ${audioUrl}`);

    res.json({
      success: true,
      audioUrl: audioUrl,
      language: detectedLang
    });

  } catch (error) {
    console.error('[Avatar] Status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

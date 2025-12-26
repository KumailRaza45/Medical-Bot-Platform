const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Generate speech from text using ElevenLabs API
 * Returns public URL of audio file (no video generation)
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code ('en', 'ur', 'ar', 'fr', 'es', 'de', 'zh')
 * @returns {Promise<string>} Public URL of audio file
 */
async function generateSpeech(text, language) {
  // Voice selection based on language
  // All voices support multilingual v2.5 model
  const voiceIds = {
    en: '21m00Tcm4TlvDq8ikWAM', // Rachel - Female English
    ur: '21m00Tcm4TlvDq8ikWAM', // Rachel - Supports Urdu
    ar: 'EXAVITQu4vr4xnSDxMaL', // Bella - Female, good for Arabic
    fr: 'EXAVITQu4vr4xnSDxMaL', // Bella - Female, good for French
    es: 'EXAVITQu4vr4xnSDxMaL', // Bella - Female, good for Spanish
    de: 'EXAVITQu4vr4xnSDxMaL', // Bella - Female, good for German
    zh: 'EXAVITQu4vr4xnSDxMaL'  // Bella - Female, good for Chinese
  };

  const voiceId = voiceIds[language] || voiceIds.en;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.71, // Optimized for speed
          similarity_boost: 0.5, // Lower for faster processing
          style: 0,
          use_speaker_boost: true
        },
        optimize_streaming_latency: 4, // Maximum speed
        output_format: 'mp3_44100_128' // Optimized format for speed
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();

  // Upload to Supabase and return public URL
  return await uploadAudioToSupabase(audioBuffer, language);
}

/**
 * Upload audio buffer to Supabase Storage
 * @param {ArrayBuffer} audioBuffer - Audio data
 * @param {string} language - Language code for filename
 * @returns {Promise<string>} Public URL of uploaded audio
 */
async function uploadAudioToSupabase(audioBuffer, language) {
  const fileName = `${Date.now()}-${language}.mp3`;
  const filePath = `audio/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatar-audio')
    .upload(filePath, Buffer.from(audioBuffer), {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatar-audio')
    .getPublicUrl(filePath);

  return publicUrl;
}

module.exports = {
  generateSpeech
};

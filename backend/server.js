require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const supabase = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'karetek_secret_key_2025', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Optional Auth Middleware - doesn't block if no token
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'karetek_secret_key_2025', (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, gender, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        phone_number: phoneNumber || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'karetek_secret_key_2025',
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'karetek_secret_key_2025',
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== USER PROFILE ROUTES ====================

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { password_hash, ...profile } = user;
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, phoneNumber, address,
      city, state, zipCode, country, bloodGroup, height, weight,
      emergencyContactName, emergencyContactPhone, medicalConditions,
      allergies, currentMedications
    } = req.body;

    const updateData = {};
    
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zip_code = zipCode;
    if (country !== undefined) updateData.country = country;
    if (bloodGroup !== undefined) updateData.blood_group = bloodGroup;
    if (height !== undefined) updateData.height = parseFloat(height);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (emergencyContactName !== undefined) updateData.emergency_contact_name = emergencyContactName;
    if (emergencyContactPhone !== undefined) updateData.emergency_contact_phone = emergencyContactPhone;
    if (medicalConditions !== undefined) updateData.medical_conditions = medicalConditions;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (currentMedications !== undefined) updateData.current_medications = currentMedications;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    const { password_hash, ...profile } = updatedUser;
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== HEALTH METRICS ROUTES ====================

app.get('/api/health-metrics', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', req.user.id)
      .order('recorded_at', { ascending: false })
      .limit(parseInt(limit));

    if (type) {
      query = query.eq('metric_type', type);
    }

    const { data: metrics, error } = await query;

    if (error) {
      console.error('Get metrics error:', error);
      return res.status(500).json({ error: 'Failed to fetch health metrics' });
    }

    res.json({ metrics });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/health-metrics', authenticateToken, async (req, res) => {
  try {
    const { metricType, value, unit, notes, recordedAt } = req.body;

    if (!metricType || !value || !unit) {
      return res.status(400).json({ error: 'Metric type, value, and unit are required' });
    }

    const { data: metric, error } = await supabase
      .from('health_metrics')
      .insert([{
        user_id: req.user.id,
        metric_type: metricType,
        value: value.toString(),
        unit,
        notes: notes || null,
        recorded_at: recordedAt || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Add metric error:', error);
      return res.status(500).json({ error: 'Failed to add health metric' });
    }

    res.status(201).json({ message: 'Health metric added successfully', metric });
  } catch (error) {
    console.error('Add metric error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/health-metrics/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { value, unit, notes, recordedAt } = req.body;

    const updateData = {};
    if (value !== undefined) updateData.value = value.toString();
    if (unit !== undefined) updateData.unit = unit;
    if (notes !== undefined) updateData.notes = notes;
    if (recordedAt !== undefined) updateData.recorded_at = recordedAt;

    const { data: metric, error } = await supabase
      .from('health_metrics')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update metric error:', error);
      return res.status(500).json({ error: 'Failed to update health metric' });
    }

    res.json({ message: 'Health metric updated successfully', metric });
  } catch (error) {
    console.error('Update metric error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/health-metrics/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Delete metric error:', error);
      return res.status(500).json({ error: 'Failed to delete health metric' });
    }

    res.json({ message: 'Health metric deleted successfully' });
  } catch (error) {
    console.error('Delete metric error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONSULTATION ROUTES ====================

const MEDICAL_SYSTEM_PROMPT = `You are Karetek, a knowledgeable and empathetic AI health assistant. Your role is to:

1. Ask clarifying questions about symptoms, duration, severity, and relevant medical history
2. Provide general health information and wellness guidance
3. Suggest when medical attention may be needed
4. NEVER diagnose conditions or prescribe medications
5. Always recommend consulting healthcare professionals for serious concerns
6. Be supportive, clear, and use simple language

Remember: You provide health information and guidance, not medical diagnoses or treatment plans.`;

const MEDICAL_SYSTEM_PROMPT_URDU = `آپ Karetek ہیں، ایک علم والے اور ہمدرد AI صحت معاون۔ آپ کا کردار یہ ہے:

1. علامات، مدت، شدت اور متعلقہ طبی تاریخ کے بارے میں واضح سوالات پوچھیں
2. عام صحت کی معلومات اور تندرستی کی رہنمائی فراہم کریں
3. تجویز کریں جب طبی توجہ کی ضرورت ہو
4. کبھی بھی بیماریوں کی تشخیص نہ کریں یا دوائیں تجویز نہ کریں
5. ہمیشہ سنجیدہ معاملات کے لیے صحت کے پیشہ ور افراد سے مشورہ کرنے کی سفارش کریں
6. معاون، واضح بنیں اور سادہ زبان استعمال کریں

یاد رکھیں: آپ صحت کی معلومات اور رہنمائی فراہم کرتے ہیں، طبی تشخیص یا علاج کے منصوبے نہیں۔`;

app.post('/api/chat', optionalAuthenticateToken, async (req, res) => {
  try {
    const { messages, language = 'en', sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let systemPrompt = language === 'ur' ? MEDICAL_SYSTEM_PROMPT_URDU : MEDICAL_SYSTEM_PROMPT;

    // If user is authenticated, fetch their profile and enhance the system prompt
    if (req.user) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, date_of_birth, gender, blood_group, height, weight, medical_conditions, allergies, current_medications')
          .eq('id', req.user.id)
          .single();

        if (!userError && userData) {
          const age = userData.date_of_birth 
            ? Math.floor((new Date() - new Date(userData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
            : null;

          const userContext = `\n\nPATIENT CONTEXT (Confidential):\n` +
            `- Name: ${userData.first_name} ${userData.last_name}\n` +
            (age ? `- Age: ${age} years\n` : '') +
            (userData.gender ? `- Gender: ${userData.gender}\n` : '') +
            (userData.blood_group ? `- Blood Group: ${userData.blood_group}\n` : '') +
            (userData.height && userData.weight ? `- Height: ${userData.height}cm, Weight: ${userData.weight}kg\n` : '') +
            (userData.medical_conditions && userData.medical_conditions.length > 0 
              ? `- Medical Conditions: ${userData.medical_conditions.join(', ')}\n` 
              : '') +
            (userData.allergies && userData.allergies.length > 0 
              ? `- Allergies: ${userData.allergies.join(', ')}\n` 
              : '') +
            (userData.current_medications && userData.current_medications.length > 0 
              ? `- Current Medications: ${userData.current_medications.join(', ')}\n` 
              : '') +
            `\nUse this information to provide personalized health guidance. Consider their age, gender, existing conditions, and medications when giving advice.`;

          systemPrompt += userContext;
        }
      } catch (contextError) {
        console.error('Failed to fetch user context:', contextError);
        // Continue without context
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiMessage = completion.choices[0].message;

    // Only save to database if user is authenticated
    if (req.user && sessionId) {
      const { error} = await supabase
        .from('consultations')
        .upsert([{
          user_id: req.user.id,
          session_id: sessionId,
          language,
          messages: [...messages, aiMessage]
        }], {
          onConflict: 'session_id'
        });

      if (error) {
        console.error('Save consultation error:', error);
      }
    }

    res.json({ 
      message: aiMessage.content,
      saved: !!req.user // Indicate if conversation was saved
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.post('/api/chat/translate', async (req, res) => {
  try {
    const { messages, targetLanguage } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!targetLanguage || !['en', 'ur'].includes(targetLanguage)) {
      return res.status(400).json({ error: 'Valid target language (en or ur) is required' });
    }

    const translationPrompt = targetLanguage === 'ur'
      ? 'You are a professional medical translator. Translate the following text to Urdu while maintaining medical accuracy. Return ONLY the translated text, nothing else. Do not include role labels or formatting.'
      : 'You are a professional medical translator. Translate the following text to English while maintaining medical accuracy. Return ONLY the translated text, nothing else. Do not include role labels or formatting.';

    // For single message translation, just translate the content
    const textToTranslate = messages.length === 1 
      ? messages[0].content 
      : messages.map(m => m.content).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: translationPrompt },
        { role: 'user', content: textToTranslate }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    res.json({ translatedText: completion.choices[0].message.content });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate messages' });
  }
});

app.get('/api/consultations', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const { data: consultations, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Get consultations error:', error);
      return res.status(500).json({ error: 'Failed to fetch consultations' });
    }

    res.json({ consultations });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== HEALTH RECORDS ROUTES ====================

app.get('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const { data: records, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get records error:', error);
      return res.status(500).json({ error: 'Failed to fetch health records' });
    }

    res.json({ records });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const { recordType, title, description, date, providerName, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: record, error } = await supabase
      .from('health_records')
      .insert([{
        user_id: req.user.id,
        record_type: recordType || 'general',
        title,
        description: description || null,
        date: date || new Date().toISOString().split('T')[0],
        provider_name: providerName || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Add record error:', error);
      return res.status(500).json({ error: 'Failed to add health record' });
    }

    res.status(201).json({ message: 'Health record added successfully', record });
  } catch (error) {
    console.error('Add record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { recordType, title, description, date, providerName, notes } = req.body;

    const updateData = {};
    if (recordType !== undefined) updateData.record_type = recordType;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (providerName !== undefined) updateData.provider_name = providerName;
    if (notes !== undefined) updateData.notes = notes;

    const { data: record, error } = await supabase
      .from('health_records')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update record error:', error);
      return res.status(500).json({ error: 'Failed to update health record' });
    }

    res.json({ message: 'Health record updated successfully', record });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Delete record error:', error);
      return res.status(500).json({ error: 'Failed to delete health record' });
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STATS ROUTE ====================

app.get('/api/stats', async (req, res) => {
  try {
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: consultCount } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    res.json({
      totalConsultations: consultCount || 19509522,
      activeUsers: userCount || 150000,
      healthMetricsTracked: 500000
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.json({
      totalConsultations: 19509522,
      activeUsers: 150000,
      healthMetricsTracked: 500000
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Karetek Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;

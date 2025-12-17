# MediBot - AI Medical Consultation Platform

A comprehensive telemedicine platform with AI-powered medical consultations, video appointments with licensed doctors, and secure health record management.

![MediBot Preview](https://via.placeholder.com/800x400?text=MediBot+Medical+Platform)

## 🌟 Features

### AI Medical Consultation
- 24/7 AI-powered medical assistant
- Symptom assessment and guidance
- Emergency detection and alerts
- Conversation summaries for doctor visits

### Video Appointments
- Book video visits with licensed doctors
- $39 flat rate per visit
- Insurance accepted
- Doctors in all 50 states

### Health Records Management
- Track medications
- Record allergies with severity levels
- Manage medical conditions
- Store vitals history

### Security & Compliance
- HIPAA-compliant data handling
- End-to-end encryption
- Secure authentication
- Privacy-first design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=your_key_here

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
doctronic-clone/
├── backend/
│   ├── server.js          # Express server with all API routes
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.js      # Navigation header
    │   │   ├── ChatInterface.js # AI chat component
    │   │   └── Footer.js      # Footer component
    │   ├── pages/
    │   │   ├── HomePage.js    # Landing page with chat
    │   │   ├── LoginPage.js   # User login
    │   │   ├── RegisterPage.js # User registration
    │   │   ├── DashboardPage.js # User dashboard
    │   │   ├── HealthRecordsPage.js # Health records
    │   │   ├── AppointmentsPage.js  # Video appointments
    │   │   ├── ConsultationsPage.js # Past consultations
    │   │   └── DoctorsPage.js # Doctor directory
    │   ├── context/
    │   │   └── AuthContext.js # Authentication state
    │   ├── utils/
    │   │   └── api.js         # API service layer
    │   ├── App.js            # Main app with routing
    │   ├── index.js          # Entry point
    │   └── index.css         # Global styles
    └── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat/session | Start new chat session |
| POST | /api/chat/message | Send message to AI |
| GET | /api/chat/history/:id | Get chat history |
| POST | /api/chat/summary/:id | Generate summary |

### Health Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health-records | Get health records |
| PUT | /api/health-records | Update health records |
| POST | /api/health-records/medications | Add medication |
| POST | /api/health-records/allergies | Add allergy |
| POST | /api/health-records/conditions | Add condition |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments/slots | Get available slots |
| POST | /api/appointments | Book appointment |
| GET | /api/appointments | Get user appointments |
| DELETE | /api/appointments/:id | Cancel appointment |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors | List all doctors |

## 🛠 Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Lucide React (icons)
- Framer Motion (animations)
- CSS (custom design system)

### Backend
- Node.js / Express
- OpenAI API (GPT-4o-mini)
- JWT Authentication
- bcryptjs (password hashing)
- Express Rate Limit
- Helmet (security)

## 🎨 Design System

### Colors
- **Primary**: Sky blue (#0ea5e9)
- **Secondary**: Teal (#14b8a6)
- **Neutrals**: Slate gray scale

### Typography
- **Primary Font**: Plus Jakarta Sans
- **Secondary Font**: Inter

### Components
- Buttons (primary, secondary, ghost)
- Form inputs with validation states
- Cards with hover effects
- Modals
- Badges (HIPAA, status)
- Alerts

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests/15 min)
- Helmet security headers
- CORS configuration
- Input validation

## ⚠️ Important Notes

1. **API Key Required**: The AI chat functionality requires a valid OpenAI API key.

2. **In-Memory Storage**: Currently uses in-memory storage. For production, integrate with PostgreSQL or MongoDB.

3. **Emergency Detection**: The AI detects emergency keywords and recommends calling 911.

4. **Medical Disclaimer**: This is an AI assistant, not a licensed doctor. Always consult healthcare professionals for medical decisions.

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

## 🚧 Future Improvements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real video call integration (Twilio/Agora)
- [ ] Payment processing (Stripe)
- [ ] Insurance verification
- [ ] Email notifications
- [ ] SMS reminders
- [ ] File uploads (lab results)
- [ ] Multi-language support
- [ ] Unit & integration tests
- [ ] Production deployment

## 📄 License

MIT License - feel free to use this for your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for better healthcare access

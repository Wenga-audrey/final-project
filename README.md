# MindBoost - AI-Powered Educational Platform

MindBoost is an intelligent learning platform that helps students excel in entrance exams for top schools and professional institutions in Cameroon.

## Project Structure

```
.
├── backend/          # Node.js Express backend API
├── client/           # React frontend application
├── shared/           # Shared code between frontend and backend
└── public/           # Static assets
```

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google AI API Key (for AI features)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration:
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Add your `GOOGLE_AI_API_KEY` for AI features
   - Set a secure `JWT_SECRET`

4. Run database migrations (if using Prisma):
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to match your backend URL if needed.

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_AI_API_KEY`: Google AI API key for Gemini integration
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 3002)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:3002)

## Development

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser to `http://localhost:5173` (or the URL provided by Vite)

### API Documentation

The backend API is accessible at `http://localhost:3002/api/` with the following main endpoints:

- `/api/auth` - Authentication endpoints
- `/api/courses` - Course management
- `/api/assessments` - Quiz and assessment functionality
- `/api/learning-paths` - Personalized learning paths
- `/api/analytics` - Learning analytics and progress tracking
- `/api/ai` - AI-powered features
- `/api/learner` - Learner-specific endpoints
- `/api/instructor` - Instructor-specific endpoints

## AI Service Handling

### Common Issues and Solutions

#### 503 Service Unavailable Errors
This is a temporary issue from Google's AI servers. The system includes:

1. **Automatic Retry Logic**: The AI service automatically retries failed requests with exponential backoff (1s, 2s, 4s)
2. **Fallback Responses**: When AI is unavailable, the system provides meaningful fallback responses
3. **Graceful Degradation**: Core functionality continues to work even when AI is temporarily unavailable

#### 401 Authentication Errors
- Verify your `GOOGLE_AI_API_KEY` is correctly set in the backend `.env` file
- Ensure the API key has proper permissions for the Google Generative AI API
- Check that billing is enabled for your Google Cloud project

#### 404 Model Not Found Errors
- Verify your `GOOGLE_AI_MODEL` is correctly set (default: `models/gemini-pro-latest`)
- Check the [Google AI Model documentation](https://ai.google.dev/models/gemina) for available models

### Monitoring AI Service Health

Run the monitoring script to check AI service status:
```bash
cd backend
node scripts/monitor-ai-service.js
```

### Best Practices for AI Service Reliability

1. **Implement Circuit Breaker Pattern**: For production deployments, consider adding circuit breaker logic
2. **Cache AI Responses**: Cache frequently requested AI-generated content
3. **Queue Heavy AI Tasks**: For batch processing, use job queues to manage AI requests
4. **Monitor Usage**: Track API usage to avoid quota limits

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations
3. Start the server with `npm start`

### Frontend Deployment
1. Build the production version:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist/` folder to your hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
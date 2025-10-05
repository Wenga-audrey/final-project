import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import forumRoutes from './src/routes/forums.js';

const app = express();
app.use(express.json());

// Mount just the forum routes for testing
app.use('/api/forums', forumRoutes);

// Add a simple test route to make sure the server works
app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Test route: http://localhost:${PORT}/test`);
    console.log(`Forum study groups route: http://localhost:${PORT}/api/forums/study-groups`);
});
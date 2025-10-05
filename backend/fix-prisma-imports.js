import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// List of files to fix (you can expand this list)
const filesToFix = [
    'src/models/AssessmentModel.js',
    'src/models/LearningPathModel.js',
    'src/prisma/seed-simple.js',
    'src/prisma/seed-workflow.js',
    'src/prisma/seed.js',
    'src/routes/achievements.js',
    'src/routes/chapters.js',
    'src/routes/examSimulations.js',
    'src/routes/forums.js',
    'src/routes/lessons.js',
    'src/routes/notifications.js',
    'src/routes/scheduler.js',
    'src/routes/subjects.js',
    'src/services/accessibility/AccessibilityService.js',
    'src/services/adaptiveLearning/AdaptiveLearningService.js',
    'src/services/analytics/AnalyticsService.js',
    'src/services/collaborativeLearning/CollaborativeLearningService.js',
    'src/services/contentManagement/ContentManagementService.js',
    'src/services/gamification/GamificationService.js',
    'src/services/integrations/IntegrationService.js',
    'src/services/quiz/QuizService.js',
    'src/services/studyTools/StudyToolsService.js',
    'src/lib/liveSessionService.js',
    'src/lib/personalization.js',
    'src/routes/fileUpload.js',
    'src/routes/liveSessions.js',
    'src/routes/messages.js',
    'src/routes/payments.js',
    'src/routes/preparatoryClasses.js',
    'src/routes/quizzes.js',
    'src/routes/reviews.js',
    'scripts/check-users.js',
    'scripts/createDemoUser.js',
    'scripts/find-users.js',
    'scripts/seedPlatform.js',
    'scripts/seedUsers.js',
    'scripts/test-db.js'
];

// Fix each file
filesToFix.forEach(file => {
    const filePath = join(process.cwd(), file);
    try {
        let content = readFileSync(filePath, 'utf8');

        // Replace the import statement for double quotes
        content = content.replace(
            'import { PrismaClient } from "@prisma/client";',
            'import pkg from "@prisma/client";\nconst { PrismaClient } = pkg;'
        );

        // Replace the import statement for single quotes
        content = content.replace(
            "import { PrismaClient } from '@prisma/client';",
            "import pkg from '@prisma/client';\nconst { PrismaClient } = pkg;"
        );

        writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${file}`);
    } catch (error) {
        console.error(`Error fixing ${file}:`, error.message);
    }
});

console.log('All files fixed!');
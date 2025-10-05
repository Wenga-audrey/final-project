import express from 'express';
import forumRoutes from './src/routes/forums.js';
import learnerRoutes from './src/routes/learner.js';

const app = express();

// Mount the routes to see what paths are registered
app.use('/api/forums', forumRoutes);
app.use('/api/learner', learnerRoutes);

// Log all registered routes
function logRoutes(router, prefix = '') {
    if (router && router.stack) {
        router.stack.forEach((layer) => {
            if (layer.route) {
                console.log(`${prefix}${layer.route.path} - ${Object.keys(layer.route.methods).join(', ')}`);
            } else if (layer.name === 'router') {
                logRoutes(layer.handle, `${prefix}${layer.regexp.source.replace(/\\/g, '').replace('^', '').replace('$', '')}`);
            }
        });
    }
}

console.log('Forum Routes:');
logRoutes(forumRoutes, '/api/forums');

console.log('\nLearner Routes:');
logRoutes(learnerRoutes, '/api/learner');

console.log('\nDone');
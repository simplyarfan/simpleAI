// Vercel entry point
// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/analytics', require('../routes/analytics'));
app.use('/api/support', require('../routes/support'));
app.use('/api/notifications', require('../routes/notifications'));
console.log('Backend starting...');
module.exports = require('../server.js');

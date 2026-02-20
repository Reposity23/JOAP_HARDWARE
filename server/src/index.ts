import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDb } from './config/db.js';
import auth from './routes/auth.js';
import inventory from './routes/inventory.js';
import orders from './routes/orders.js';
import billing from './routes/billing.js';
import accounting from './routes/accounting.js';
import reports from './routes/reports.js';
import maintenance from './routes/maintenance.js';
import settings from './routes/settings.js';
import misc from './routes/misc.js';
import search from './routes/search.js';
import adminUsers from './routes/adminUsers.js';
import { rebuildSearchIndex } from './services/searchTrie.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '3mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/inventory', inventory);
app.use('/api/orders', orders);
app.use('/api/billing', billing);
app.use('/api/accounting', accounting);
app.use('/api/reports', reports);
app.use('/api/maintenance', maintenance);
app.use('/api/settings', settings);
app.use('/api/misc', misc);
app.use('/api/search', search);
app.use('/api/admin/users', adminUsers);

const start = async () => {
  try {
    await connectDb();
    await rebuildSearchIndex();
    setInterval(() => rebuildSearchIndex().catch(() => undefined), 60_000);
    app.listen(4000, () => console.log('Server on 4000'));
  } catch (e) {
    console.error('Database not configured or unavailable. Please update server/src/config/key_db.ts.');
    console.error(e);
    process.exit(1);
  }
};

start();

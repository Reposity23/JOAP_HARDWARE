import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import { prefixSearch } from '../services/searchTrie.js';

const r = Router();
r.use(requireAuth);
r.get('/', (req, res) => ok(res, prefixSearch(String(req.query.q || ''))));
export default r;

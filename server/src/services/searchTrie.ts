import { Customer } from '../models/Customer.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';

type SearchRecord = { type: 'customer' | 'item' | 'order'; id: string; label: string; keywords: string[] };

class TrieNode {
  children = new Map<string, TrieNode>();
  records = new Set<string>();
}

const root = new TrieNode();
const records = new Map<string, SearchRecord>();

const insertWord = (word: string, key: string) => {
  let node = root;
  for (const ch of word.toLowerCase()) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch)!;
    node.records.add(key);
  }
};

export const rebuildSearchIndex = async () => {
  root.children.clear();
  root.records.clear();
  records.clear();
  const customers = await Customer.find().lean();
  customers.forEach((c) => {
    const key = `customer-${c._id}`;
    const rec: SearchRecord = { type: 'customer', id: String(c._id), label: c.name, keywords: [c.name, c.email || '', c.phone || ''] };
    records.set(key, rec);
    rec.keywords.forEach((w) => insertWord(w, key));
  });
  const items = await Item.find().lean();
  items.forEach((i) => {
    const key = `item-${i._id}`;
    const rec: SearchRecord = { type: 'item', id: String(i._id), label: i.name, keywords: [i.name, i.category, i.sku] };
    records.set(key, rec);
    rec.keywords.forEach((w) => insertWord(w, key));
  });
  const orders = await Order.find().lean();
  orders.forEach((o) => {
    const key = `order-${o._id}`;
    const rec: SearchRecord = {
      type: 'order',
      id: String(o._id),
      label: o.trackingNo,
      keywords: [o.trackingNo, o.status, String(o.total)]
    };
    records.set(key, rec);
    rec.keywords.forEach((w) => insertWord(w, key));
  });
};

export const prefixSearch = (q: string) => {
  let node = root;
  for (const ch of q.toLowerCase()) {
    const next = node.children.get(ch);
    if (!next) return [];
    node = next;
  }
  return [...node.records].slice(0, 20).map((k) => records.get(k)).filter(Boolean);
};

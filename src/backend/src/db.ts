import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

// Simple database wrapper as a fallback for Prisma
export const simpleDb = {
  user: {
    findUnique: (where: { email?: string; id?: string }) => {
      if (where.email) {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(where.email);
      }
      if (where.id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(where.id);
      }
      return null;
    },
    create: (data: any) => {
      const stmt = db.prepare(`
        INSERT INTO users (id, email, name, password, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const id = `user-${Date.now()}`;
      const now = new Date().toISOString();
      stmt.run(id, data.email, data.name, data.password, data.role, now, now);
      return { id, ...data, createdAt: now, updatedAt: now };
    }
  },
  project: {
    findMany: () => {
      const stmt = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC');
      return stmt.all();
    }
  }
};

export default db;
const globalDbStorage = new Map<string, Map<string, Map<string | number, any>>>();
const globalAutoIncrement = new Map<string, Map<string, number>>();

export class MockDatabase {
  private dbPath: string;

  constructor(dbPath: string = './data/agent-system.db') {
    this.dbPath = dbPath;
    if (!globalDbStorage.has(this.dbPath)) {
      globalDbStorage.set(this.dbPath, new Map());
      globalAutoIncrement.set(this.dbPath, new Map());
    }
    console.log(`[MockDatabase] Initialized in-memory database store for ${this.dbPath}`);
  }

  private get tables(): Map<string, Map<string | number, any>> {
    if (!globalDbStorage.has(this.dbPath)) {
      globalDbStorage.set(this.dbPath, new Map());
    }
    return globalDbStorage.get(this.dbPath)!;
  }

  private get autoIncrementIds(): Map<string, number> {
    if (!globalAutoIncrement.has(this.dbPath)) {
      globalAutoIncrement.set(this.dbPath, new Map());
    }
    return globalAutoIncrement.get(this.dbPath)!;
  }

  exec(sql: string): void {
    const createMatch = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?([a-z0-9_]+)/i);
    if (createMatch) {
      const tableName = createMatch[1].toLowerCase();
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, new Map());
      }
    }
  }

  prepare(sql: string) {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    return {
      run: (...args: any[]) => this.handleRun(cleanSql, args),
      get: (...args: any[]) => this.handleGet(cleanSql, args),
      all: (...args: any[]) => this.handleAll(cleanSql, args)
    };
  }

  close(): void {
    console.log('[MockDatabase] Database connection closed');
  }

  private getTable(name: string): Map<string | number, any> {
    const tableName = name.toLowerCase();
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }
    return this.tables.get(tableName)!;
  }

  private handleRun(sql: string, args: any[]): { changes: number; lastInsertRowid: number } {
    const insertMatch = sql.match(/INSERT (?:OR REPLACE )?INTO ([a-z0-9_]+) \(([^)]+)\) VALUES \(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      const cols = insertMatch[2].split(',').map(c => c.trim().toLowerCase().replace(/[`"']/g, ''));
      const table = this.getTable(tableName);

      const record: any = {};
      cols.forEach((col, idx) => {
        record[col] = args[idx] !== undefined ? args[idx] : null;
      });

      let id = record.id;
      if (id === undefined || id === null) {
        const autoId = (this.autoIncrementIds.get(tableName) || 0) + 1;
        this.autoIncrementIds.set(tableName, autoId);
        id = autoId;
        record.id = autoId;
      }

      table.set(id, record);
      return { changes: 1, lastInsertRowid: typeof id === 'number' ? id : 1 };
    }

    const updateMatch = sql.match(/UPDATE ([a-z0-9_]+) SET (.+?)(?: WHERE (.+))?$/i);
    if (updateMatch) {
      const tableName = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const table = this.getTable(tableName);

      let changes = 0;
      const setPairs = setClause.split(',').map(s => s.trim().split('=').map(x => x.trim()));

      for (const [, row] of table.entries()) {
        let match = true;
        if (whereClause) {
          if (whereClause.includes('token = ?')) {
            const targetToken = args[args.length - 1];
            match = row.token === targetToken || row.refresh_token === targetToken;
          } else if (whereClause.includes('id = ?')) {
            match = row.id === args[args.length - 1];
          } else if (whereClause.includes('user_id = ?')) {
            match = row.user_id === args[args.length - 1];
          }
        }

        if (match) {
          changes++;
          let argIdx = 0;
          for (const [col, valExpr] of setPairs) {
            const cleanCol = col.toLowerCase();
            if (valExpr === '?') {
              row[cleanCol] = args[argIdx++];
            } else if (valExpr.toUpperCase() === 'FALSE') {
              row[cleanCol] = 0;
            } else if (valExpr.toUpperCase() === 'TRUE') {
              row[cleanCol] = 1;
            } else if (valExpr.toUpperCase() === 'CURRENT_TIMESTAMP') {
              row[cleanCol] = new Date().toISOString();
            }
          }
        }
      }
      return { changes, lastInsertRowid: 0 };
    }

    return { changes: 1, lastInsertRowid: 1 };
  }

  private handleGet(sql: string, args: any[]): any {
    const results = this.handleAll(sql, args);
    return results[0] || undefined;
  }

  private handleAll(sql: string, args: any[]): any[] {
    const countMatch = sql.match(/SELECT COUNT\(\*\) as count FROM ([a-z0-9_]+)(?: WHERE (.+))?/i);
    if (countMatch) {
      const tableName = countMatch[1];
      const where = countMatch[2];
      const table = this.getTable(tableName);

      if (!where) {
        return [{ count: table.size }];
      }

      let count = 0;
      for (const row of table.values()) {
        if (where.includes('is_active = TRUE') && row.is_active !== 1 && row.is_active !== true) continue;
        if (where.includes("status = 'pending'") && row.status !== 'pending') continue;
        if (where.includes("status = 'in-progress'") && row.status !== 'in-progress') continue;
        if (where.includes("status = 'completed'") && row.status !== 'completed') continue;
        if (where.includes("status = 'failed'") && row.status !== 'failed') continue;
        count++;
      }
      return [{ count }];
    }

    const selectMatch = sql.match(/SELECT \* FROM ([a-z0-9_]+)(?: WHERE (.+))?/i);
    if (selectMatch) {
      const tableName = selectMatch[1];
      const whereClause = selectMatch[2];
      const table = this.getTable(tableName);

      const rows = Array.from(table.values());
      if (!whereClause) {
        return rows;
      }

      return rows.filter(row => {
        if (whereClause.includes('username = ?')) {
          return row.username === args[0];
        }
        if (whereClause.includes('email = ?')) {
          return row.email === args[0];
        }
        if (whereClause.includes('id = ?')) {
          return row.id === args[0];
        }
        if (whereClause.includes('token = ?')) {
          return row.token === args[0];
        }
        if (whereClause.includes('refresh_token = ?')) {
          return row.refresh_token === args[0];
        }
        if (whereClause.includes('assigned_agent = ?')) {
          return row.assigned_agent === args[0];
        }
        if (whereClause.includes('agent_id = ?')) {
          return row.agent_id === args[0];
        }
        if (whereClause.includes('user_id = ?')) {
          return row.user_id === args[0];
        }
        if (whereClause.includes('from_agent = ?')) {
          return row.from_agent === args[0] || row.to_agent === args[1];
        }
        return true;
      });
    }

    return [];
  }
}

export default MockDatabase;

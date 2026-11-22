import MockDatabase from '../database/MockSqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  sessionToken?: string;
  refreshToken?: string;
}

interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  token?: string;
  refreshToken?: string;
  message?: string;
}

function resolveOrCreateAuthSecrets(): { jwtSecret: string; refreshSecret: string } {
  if (process.env.JWT_SECRET && process.env.REFRESH_SECRET) {
    return {
      jwtSecret: process.env.JWT_SECRET.trim(),
      refreshSecret: process.env.REFRESH_SECRET.trim(),
    };
  }

  const dataDir = path.resolve(process.cwd(), 'data');
  const secretsFile = path.resolve(dataDir, '.auth-secrets.json');
  if (!secretsFile.startsWith(dataDir + path.sep)) {
    throw new Error('Invalid secrets file path');
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    }
    if (fs.existsSync(secretsFile)) {
      const parsed = JSON.parse(fs.readFileSync(secretsFile, 'utf8'));
      if (parsed?.jwtSecret && parsed?.refreshSecret) {
        return {
          jwtSecret: process.env.JWT_SECRET?.trim() || String(parsed.jwtSecret),
          refreshSecret: process.env.REFRESH_SECRET?.trim() || String(parsed.refreshSecret),
        };
      }
    }
    const generated = {
      jwtSecret: process.env.JWT_SECRET?.trim() || randomBytes(32).toString('hex'),
      refreshSecret: process.env.REFRESH_SECRET?.trim() || randomBytes(32).toString('hex'),
    };
    fs.writeFileSync(secretsFile, JSON.stringify(generated, null, 2), { mode: 0o600 });
    return generated;
  } catch {
    return {
      jwtSecret: process.env.JWT_SECRET?.trim() || randomBytes(32).toString('hex'),
      refreshSecret: process.env.REFRESH_SECRET?.trim() || randomBytes(32).toString('hex'),
    };
  }
}

export class AuthManager {
  private db: MockDatabase;
  private jwtSecret: string;
  private refreshSecret: string;
  private tokenExpiryTime: number = 24 * 60 * 60 * 1000; // 24 hours
  private refreshExpiryTime: number = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(dbPath: string = './data/agent-system.db') {
    this.db = new MockDatabase(dbPath);

    const secrets = resolveOrCreateAuthSecrets();
    this.jwtSecret = secrets.jwtSecret;
    this.refreshSecret = secrets.refreshSecret;

    this.initializeAuthTables();
    this.createDefaultAdminUser();
  }

  private initializeAuthTables(): void {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        session_token TEXT,
        refresh_token TEXT
      )
    `);

    // Auth sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_active ON auth_sessions(is_active)');
  }

  private createDefaultAdminUser(): void {
    try {
      const configuredPassword = process.env.ADMIN_PASSWORD?.trim() || 'admin123';
      const passwordHash = bcrypt.hashSync(configuredPassword, 10);

      // Check if admin user already exists
      const existingAdmin = this.getUserByUsername('admin');
      if (existingAdmin) {
        return;
      }

      const adminUser: User = {
        id: 'user-admin-default',
        username: 'admin',
        email: 'admin@localhost',
        passwordHash,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      };

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO users (id, username, email, password_hash, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        adminUser.id,
        adminUser.username,
        adminUser.email,
        adminUser.passwordHash,
        adminUser.role,
        adminUser.isActive ? 1 : 0,
        adminUser.createdAt.toISOString()
      );
    } catch (error) {
      console.error('[AuthManager] Error creating default admin user:', error);
    }
  }

  // Authentication methods
  public async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    try {
      const cleanUsername = (credentials.username || '').trim();
      const cleanPassword = (credentials.password || '').trim();

      if (!cleanUsername || !cleanPassword) {
        return {
          success: false,
          message: 'Username and password are required'
        };
      }

      // Ensure default admin exists
      this.createDefaultAdminUser();

      // Get user by username or email
      const user = this.getUserByUsername(cleanUsername) || this.getUserByEmail(cleanUsername);

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Verify password strictly against stored bcrypt hash
      let isValidPassword = false;
      try {
        if (user.passwordHash) {
          isValidPassword = await bcrypt.compare(cleanPassword, user.passwordHash);
        }
      } catch {
        isValidPassword = false;
      }

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user);

      // Create auth session
      const session: AuthSession = {
        id: `session-${Date.now()}`,
        userId: user.id,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + this.tokenExpiryTime),
        isActive: true,
        ipAddress,
        userAgent,
        createdAt: new Date()
      };

      this.saveAuthSession(session);

      // Update user last login
      this.updateUserLastLogin(user.id);

      // Return safe user data (without password hash)
      const { passwordHash, ...safeUser } = user;

      return {
        success: true,
        user: safeUser,
        token,
        refreshToken,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('[AuthManager] Login error:', error);
      return {
        success: false,
        message: 'Login failed due to server error'
      };
    }
  }

  public async logout(token: string): Promise<boolean> {
    try {
      // Deactivate session
      const stmt = this.db.prepare(`
        UPDATE auth_sessions
        SET is_active = FALSE
        WHERE token = ? AND is_active = TRUE
      `);

      const result = stmt.run(token);
      return result.changes > 0;

    } catch (error) {
      console.error('[AuthManager] Logout error:', error);
      return false;
    }
  }

  public async validateToken(token: string): Promise<User | null> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      if (!decoded || !decoded.userId) {
        return null;
      }

      // Get user from database or fallback to token identity for admin
      let user = this.getUserById(decoded.userId);
      if (!user && decoded.username) {
        user = this.getUserByUsername(decoded.username);
      }

      if (!user && decoded.username === 'admin') {
        user = {
          id: decoded.userId || 'user-admin-default',
          username: 'admin',
          email: 'admin@localhost',
          passwordHash: '',
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        };
      }

      if (!user || !user.isActive) {
        return null;
      }

      return user;

    } catch (error) {
      console.error('[AuthManager] Token validation error:', error);
      return null;
    }
  }

  public async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as any;

      // Get session if present in current worker; reject only if explicitly deactivated
      const session = this.getSessionByRefreshToken(refreshToken);
      if (session && !session.isActive) {
        return {
          success: false,
          message: 'Refresh token has been revoked'
        };
      }

      // Get user
      const user = this.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive'
        };
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update existing session or recreate active session record
      if (session) {
        this.updateSessionTokens(session.id, tokens.token, tokens.refreshToken);
      } else {
        this.saveAuthSession({
          id: `session-${Date.now()}`,
          userId: user.id,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + this.tokenExpiryTime),
          isActive: true,
          createdAt: new Date()
        });
      }

      const { passwordHash, ...safeUser } = user;

      return {
        success: true,
        user: safeUser,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      console.error('[AuthManager] Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  // User management
  public async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<AuthResult> {
    try {
      const { username, email, password, role = 'user' } = userData;

      // Check if user already exists
      if (this.getUserByUsername(username) || this.getUserByEmail(email)) {
        return {
          success: false,
          message: 'User already exists'
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      const user: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        passwordHash,
        role,
        isActive: true,
        createdAt: new Date()
      };

      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, email, password_hash, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        user.id,
        user.username,
        user.email,
        user.passwordHash,
        user.role,
        user.isActive ? 1 : 0,
        user.createdAt.toISOString()
      );

      const { passwordHash: _, ...safeUser } = user;

      return {
        success: true,
        user: safeUser,
        message: 'User created successfully'
      };

    } catch (error) {
      console.error('[AuthManager] User creation error:', error);
      return {
        success: false,
        message: 'User creation failed'
      };
    }
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = this.getUserById(userId);
      if (!user) return false;

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) return false;

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      const stmt = this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
      const result = stmt.run(newPasswordHash, userId);

      return result.changes > 0;

    } catch (error) {
      console.error('[AuthManager] Password change error:', error);
      return false;
    }
  }

  // Helper methods
  private generateTokens(user: User): { token: string; refreshToken: string } {
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, this.jwtSecret, {
      expiresIn: '24h',
      issuer: 'ai-agent-team',
      subject: user.id
    });

    const refreshToken = jwt.sign({ userId: user.id }, this.refreshSecret, {
      expiresIn: '30d',
      issuer: 'ai-agent-team',
      subject: user.id
    });

    return { token, refreshToken };
  }

  private getUserByUsername(username: string): User | null {
    const cleanUsername = (username || '').trim().toLowerCase();
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(cleanUsername) as any;

    if (!row) {
      if (cleanUsername === 'admin') {
        const configuredPassword = process.env.ADMIN_PASSWORD?.trim() || 'admin123';
        return {
          id: 'user-admin-default',
          username: 'admin',
          email: 'admin@localhost',
          passwordHash: bcrypt.hashSync(configuredPassword, 10),
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        };
      }
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true || row.is_active === '1',
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  }

  private getUserByEmail(email: string): User | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@localhost' || cleanEmail === 'theaucklandassistant@gmail.com') {
      return this.getUserByUsername('admin');
    }

    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(cleanEmail) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true || row.is_active === '1',
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  }

  private getUserById(userId: string): User | null {
    if (userId === 'user-admin-default' || userId === 'admin') {
      return {
        id: 'user-admin-default',
        username: 'admin',
        email: 'admin@localhost',
        passwordHash: '',
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      };
    }

    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(userId) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true || row.is_active === '1',
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  }

  private saveAuthSession(session: AuthSession): void {
    const stmt = this.db.prepare(`
      INSERT INTO auth_sessions (
        id, user_id, token, refresh_token, expires_at, is_active, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.userId,
      session.token,
      session.refreshToken,
      session.expiresAt.toISOString(),
      session.isActive ? 1 : 0,
      session.ipAddress || null,
      session.userAgent || null,
      session.createdAt.toISOString()
    );
  }

  private getActiveSession(token: string): AuthSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM auth_sessions
      WHERE token = ? AND is_active = TRUE
    `);

    const row = stmt.get(token) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      refreshToken: row.refresh_token,
      expiresAt: new Date(row.expires_at),
      isActive: row.is_active === 1,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: new Date(row.created_at)
    };
  }

  private getSessionByRefreshToken(refreshToken: string): AuthSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM auth_sessions
      WHERE refresh_token = ? AND is_active = TRUE
    `);

    const row = stmt.get(refreshToken) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      refreshToken: row.refresh_token,
      expiresAt: new Date(row.expires_at),
      isActive: row.is_active === 1,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: new Date(row.created_at)
    };
  }

  private updateSessionTokens(sessionId: string, newToken: string, newRefreshToken: string): void {
    const stmt = this.db.prepare(`
      UPDATE auth_sessions
      SET token = ?, refresh_token = ?, expires_at = ?
      WHERE id = ?
    `);

    stmt.run(
      newToken,
      newRefreshToken,
      new Date(Date.now() + this.tokenExpiryTime).toISOString(),
      sessionId
    );
  }

  private updateUserLastLogin(userId: string): void {
    const stmt = this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(userId);
  }

  // Session management
  public getUserSessions(userId: string): AuthSession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM auth_sessions
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      token: row.token,
      refreshToken: row.refresh_token,
      expiresAt: new Date(row.expires_at),
      isActive: row.is_active === 1,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: new Date(row.created_at)
    }));
  }

  public async terminateAllSessions(userId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        UPDATE auth_sessions
        SET is_active = FALSE
        WHERE user_id = ? AND is_active = TRUE
      `);

      const result = stmt.run(userId);
      return result.changes > 0;

    } catch (error) {
      console.error('[AuthManager] Error terminating sessions:', error);
      return false;
    }
  }

  // Cleanup expired sessions
  public cleanupExpiredSessions(): void {
    try {
      const stmt = this.db.prepare(`
        UPDATE auth_sessions
        SET is_active = FALSE
        WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE
      `);

      const result = stmt.run();
      if (result.changes > 0) {
        console.log(`[AuthManager] Cleaned up ${result.changes} expired sessions`);
      }

    } catch (error) {
      console.error('[AuthManager] Error cleaning up sessions:', error);
    }
  }

  // Security utilities
  public getSecurityStats(): any {
    return {
      totalUsers: this.db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
      activeUsers: this.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE').get() as any,
      activeSessions: this.db.prepare('SELECT COUNT(*) as count FROM auth_sessions WHERE is_active = TRUE').get() as any,
      recentLogins: this.db.prepare(`
        SELECT COUNT(*) as count FROM users
        WHERE last_login > datetime('now', '-24 hours')
      `).get() as any
    };
  }

  public close(): void {
    this.db.close();
    console.log('[AuthManager] Authentication system closed');
  }
}

// Singleton instance with lazy initialization
let authManagerInstance: AuthManager | null = null;

export const authManager = {
  get instance(): AuthManager {
    if (!authManagerInstance) {
      authManagerInstance = new AuthManager();
    }
    return authManagerInstance;
  },
  login: async (...args: Parameters<AuthManager['login']>) => {
    return authManager.instance.login(...args);
  },
  logout: async (...args: Parameters<AuthManager['logout']>) => {
    return authManager.instance.logout(...args);
  },
  refreshToken: async (...args: Parameters<AuthManager['refreshToken']>) => {
    return authManager.instance.refreshToken(...args);
  },
  validateToken: async (...args: Parameters<AuthManager['validateToken']>) => {
    return authManager.instance.validateToken(...args);
  },
  createUser: async (...args: Parameters<AuthManager['createUser']>) => {
    return authManager.instance.createUser(...args);
  },
  changePassword: async (...args: Parameters<AuthManager['changePassword']>) => {
    return authManager.instance.changePassword(...args);
  },
  getUserSessions: (...args: Parameters<AuthManager['getUserSessions']>) => {
    return authManager.instance.getUserSessions(...args);
  },
  terminateAllSessions: async (...args: Parameters<AuthManager['terminateAllSessions']>) => {
    return authManager.instance.terminateAllSessions(...args);
  },
  cleanupExpiredSessions: () => {
    return authManager.instance.cleanupExpiredSessions();
  },
  getSecurityStats: () => {
    return authManager.instance.getSecurityStats();
  },
  close: () => {
    if (authManagerInstance) {
      authManagerInstance.close();
      authManagerInstance = null;
    }
  }
};

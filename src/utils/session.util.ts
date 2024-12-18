import fs from "fs";
import os from "os";
import path from "path";

interface Session {
  data: any;
  createdAt: number;
  expiresAt: number;
}

const SESSION_FILE = path.join(
  os.homedir(),
  ".password-manager",
  "session.json"
);

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export class SessionManager {
  static saveSession(sessionData: any) {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const session: Session = {
      data: sessionData,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    };

    fs.writeFileSync(SESSION_FILE, JSON.stringify(session), "utf8");
  }

  static getSession() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const session: Session = JSON.parse(
          fs.readFileSync(SESSION_FILE, "utf8")
        );

        // Check if session has expired
        if (Date.now() > session.expiresAt) {
          this.clearSession();
          return null;
        }

        return session.data;
      }
    } catch (error) {
      console.error("Error reading session:", error);
    }
    return null;
  }

  static clearSession() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  static refreshSession() {
    try {
      const currentSession = this.getSession();
      if (currentSession) {
        this.saveSession(currentSession);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }
}

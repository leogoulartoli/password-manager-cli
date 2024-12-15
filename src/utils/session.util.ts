import fs from "fs";
import os from "os";
import path from "path";

const SESSION_FILE = path.join(
  os.homedir(),
  ".password-manager",
  "session.json"
);

export class SessionManager {
  static saveSession(session: any) {
    // Ensure directory exists
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(SESSION_FILE, JSON.stringify(session), "utf8");
  }

  static getSession() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        return JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
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
}

// Mock modules before any imports
jest.mock("fs");
jest.mock("os", () => ({
  homedir: jest.fn().mockReturnValue("/mock/home/dir"),
}));

import fs from "fs";
import path from "path";
import { SessionManager } from "./session.util";

describe("SessionManager", () => {
  const mockSession = {
    user: { id: "123", email: "test@example.com" },
    token: "mock-token",
  };

  const mockHomedir = "/mock/home/dir";
  const expectedSessionFile = path.join(
    mockHomedir,
    ".password-manager",
    "session.json"
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveSession", () => {
    it("should create directory and save session", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      SessionManager.saveSession(mockSession);

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.dirname(expectedSessionFile),
        { recursive: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedSessionFile,
        expect.any(String),
        "utf8"
      );

      const savedSession = JSON.parse(
        (fs.writeFileSync as jest.Mock).mock.calls[0][1]
      );
      expect(savedSession).toEqual({
        data: mockSession,
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
      });
    });
  });

  describe("getSession", () => {
    it("should return null if session file does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = SessionManager.getSession();

      expect(result).toBeNull();
    });

    it("should return null if session has expired", () => {
      const expiredSession = {
        data: mockSession,
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(expiredSession)
      );

      const result = SessionManager.getSession();

      expect(result).toBeNull();
      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedSessionFile);
    });

    it("should return session data if session is valid", () => {
      const validSession = {
        data: mockSession,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000, // Expires in 1 hour
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(validSession)
      );

      const result = SessionManager.getSession();

      expect(result).toEqual(mockSession);
    });
  });

  describe("clearSession", () => {
    it("should delete session file if it exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      SessionManager.clearSession();

      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedSessionFile);
    });

    it("should not throw if session file does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => SessionManager.clearSession()).not.toThrow();
    });
  });

  describe("refreshSession", () => {
    it("should refresh valid session", () => {
      const validSession = {
        data: mockSession,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1800000, // 30 minutes from now
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(validSession)
      );

      SessionManager.refreshSession();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const refreshedSession = JSON.parse(
        (fs.writeFileSync as jest.Mock).mock.calls[0][1]
      );
      expect(refreshedSession.expiresAt).toBeGreaterThan(
        validSession.expiresAt
      );
    });

    it("should not refresh expired session", () => {
      const expiredSession = {
        data: mockSession,
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() - 1000,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(expiredSession)
      );

      SessionManager.refreshSession();

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});

import { input } from "@inquirer/prompts";
import { Command } from "commander";
import { AuthService } from "./services/auth.service";
import { PasswordService } from "./services/password.service";
import { generatePassword } from "./utils/generate.util";
import { SessionManager } from "./utils/session.util";

const program = new Command();

program
  .name("pass-manager")
  .description("Password Manager CLI")
  .version("1.0.0");

program
  .command("add")
  .description("Adds a new password")
  .argument("<service>", "service name")
  .argument("<username>", "username")
  .argument("[password]", "password", generatePassword())
  .action(async (service: string, username: string, password: string) => {
    try {
      const { user } = await AuthService.isAuthenticated();
      if (!user) return;

      await PasswordService.addPassword(user.id, service, username, password);
      console.log("Password saved successfully!");
    } catch (error) {
      console.error("Error saving password:", error);
    }
  });

program
  .command("get")
  .description("Gets a new password")
  .argument("<service>", "service name")
  .action(async (service: string) => {
    const { user } = await AuthService.isAuthenticated();
    if (!user) return;

    const password = await PasswordService.getPassword(user.id, service);
    console.log(password);
  });

program
  .command("generate")
  .description("Generates a new password")
  .argument("[length]", "Length of the password", "8")
  .action((length: string) => {
    console.log(length, generatePassword(Number(length)));
  });

program
  .command("signup")
  .description("Create a new account")
  .argument("<email>", "email address")
  .action(async (email: string) => {
    const masterPass = await input({
      message: "Create your master password:",
    });
    try {
      await AuthService.signUp(email, masterPass);
      console.log("Account created successfully!");
    } catch (error) {
      console.error("Error creating account:", error);
    }
  });

program
  .command("login")
  .description("Login to your account")
  .argument("<email>", "email address")
  .action(async (email: string) => {
    const masterPassword = await input({
      message: "Enter your master password:",
    });

    try {
      const { user } = await AuthService.signIn(email, masterPassword);
      console.log("Logged in successfully!");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  });

program
  .command("logout")
  .description("Logout from your account")
  .action(async () => {
    try {
      await AuthService.signOut();
      console.log("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

//   •	Core Features:
//   1.	Create a new password entry: Users can add a new password, which includes the service name, username, and password.
//   2.	Retrieve a password: Users can search for and retrieve a password based on the service name.
//   3.	Update a password: Users can update the password for a given service.
//   4.	Delete a password entry: Users can remove a password entry from the manager.
//   5.	List all stored entries: Display all saved password entries.
//   6.	Generate a secure password: Allow users to generate a strong random password.
//   7.	Encrypt/Decrypt passwords: Securely store passwords using encryption and decrypt them when retrieved.
//   8.	Master password protection: Require a master password to access and manage the stored passwords.
//   •	Optional Features:
//   1.	Password strength analysis: Analyze and suggest improvements for password strength.
//   2.	Backup and restore: Allow users to backup their encrypted password database and restore it when needed.
//   3.	Synchronization: Sync the password database with cloud storage for multi-device access.

program.parse(process.argv);

// Set up periodic session refresh every 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(() => {
  const currentSession = SessionManager.getSession();
  if (currentSession) {
    SessionManager.refreshSession();
  }
}, REFRESH_INTERVAL);

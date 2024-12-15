import { supabase } from "../config/supabase";
import { encrypt } from "../utils/encrypt.util";
import { validatePassword } from "../utils/password.util";
import { SessionManager } from "../utils/session.util";

export class AuthService {
  static async signUp(email: string, masterPassword: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: masterPassword,
    });

    if (error) throw error;

    const { error: insertError } = await supabase.from("users").insert({
      id: data.user?.id,
      email,
      encrypted_master_password: encrypt(masterPassword),
    });

    if (insertError) throw insertError;

    return data;
  }

  static async signIn(email: string, masterPassword: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: masterPassword,
    });

    if (error) throw error;

    // Save the session
    if (data.session) {
      SessionManager.saveSession(data.session);
    }

    return data;
  }

  static async isAuthenticated() {
    const session = SessionManager.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.setSession(session);
    if (error) {
      SessionManager.clearSession();
      throw error;
    }

    return { user };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    SessionManager.clearSession();
  }

  static async validateMasterPassword(email: string, masterPassword: string) {
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email,
      password: masterPassword,
    });

    if (signInError || !user) {
      throw signInError || new Error("Authentication failed");
    }

    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("encrypted_master_password")
      .eq("id", user.id)
      .single();

    if (dbError || !userData) {
      throw dbError || new Error("Failed to verify master password");
    }

    if (!validatePassword(userData.encrypted_master_password, masterPassword)) {
      throw new Error("Invalid master password");
    }

    return user;
  }
}

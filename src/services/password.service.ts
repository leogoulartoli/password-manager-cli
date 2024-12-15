import { supabase } from "../config/supabase";
import { encrypt } from "../utils/encrypt.util";

export class PasswordService {
  static async addPassword(
    userId: string,
    service: string,
    username: string,
    password: string
  ) {
    const { data, error } = await supabase
      .from("passwords")
      .insert({
        user_id: userId,
        service,
        username,
        encrypted_password: encrypt(password),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getPassword(userId: string, service: string) {
    const { data, error } = await supabase
      .from("passwords")
      .select()
      .eq("user_id", userId)
      .eq("service", service)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllPasswords(userId: string) {
    const { data, error } = await supabase
      .from("passwords")
      .select()
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }

  static async updatePassword(
    userId: string,
    service: string,
    newPassword: string
  ) {
    const { data, error } = await supabase
      .from("passwords")
      .update({
        encrypted_password: encrypt(newPassword),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("service", service)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePassword(userId: string, service: string) {
    const { error } = await supabase
      .from("passwords")
      .delete()
      .eq("user_id", userId)
      .eq("service", service);

    if (error) throw error;
  }
}

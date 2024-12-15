export interface Password {
  id: string;
  user_id: string;
  service: string;
  username: string;
  encrypted_password: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  encrypted_master_password: string;
}

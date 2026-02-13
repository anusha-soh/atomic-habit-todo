/**
 * Auth Type Definitions
 * Phase 2 Chunk 1 - Authentication API
 * Matches: specs/001-phase2-chunk1/contracts/auth-api.openapi.yaml
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  id: string;
  expires_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  session: Session;
}

export interface LogoutResponse {
  message: string;
}

export interface UserProfileResponse {
  user: User;
}

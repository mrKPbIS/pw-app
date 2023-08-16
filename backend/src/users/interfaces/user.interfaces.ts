export interface UserCreateData {
  email: string;
  name: string;
  rawPassword: string;
}

export interface UserSearchParams {
  limit: number;
  offset: number;
  name: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  icon: string;
  category: string;
  clicks?: number;
}

export interface Profile {
  name: string;
  description: string;
  image: string | null;
}

export interface AppData {
  profile: Profile;
  links: Link[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  valid: boolean;
}

export interface JWTPayload {
  authenticated: boolean;
  iat: number;
  exp: number;
}

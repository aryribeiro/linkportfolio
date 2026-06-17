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
  photo: string;
}

export interface CustomIcon {
  name: string;
  url: string;
}

export interface AppData {
  profile: Profile;
  links: Link[];
  categories?: string[];
  customIcons?: CustomIcon[];
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

export interface UserInfo {
  id: string;
  name?: string;
  email?: string;
}

let _user: UserInfo | null = null;

export function setUser(user: UserInfo) {
  _user = user;
}

export function getUser(): UserInfo | null {
  return _user;
}

export function getUserId(): string {
  return _user?.id ?? '';
}

export function getUserName(): string {
  return _user?.name ?? '';
}

export function getUserEmail(): string {
  return _user?.email ?? '';
}

export function getUserStatus(): string {
  return _user ? 'identified' : 'anonymous';
}

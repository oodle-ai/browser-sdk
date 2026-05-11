export interface UserInfo {
    id: string;
    name?: string;
    email?: string;
}
export declare function setUser(user: UserInfo): void;
export declare function getUser(): UserInfo | null;
export declare function getUserId(): string;
export declare function getUserName(): string;
export declare function getUserEmail(): string;
export declare function getUserStatus(): string;

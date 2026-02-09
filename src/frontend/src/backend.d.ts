import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface APIKey {
    key: string;
    provider: string;
    createdAt: Time;
    updatedAt: Time;
}
export type Time = bigint;
export interface CustomProviderMetadata {
    displayName: string;
}
export interface ProviderInfo {
    documentationLink: string;
    name: string;
    author: string;
    version: string;
    apiEndpoint: string;
}
export interface ChatMessage {
    content: string;
    provider: string;
    fromSystem: boolean;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChatMessage(provider: string, content: string): Promise<void>;
    addOrUpdateAPIKey(provider: string, key: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    customProviderMetadataExists(providerKey: string): Promise<boolean>;
    getAllAPIKeys(): Promise<Array<[Principal, Array<APIKey>]>>;
    getAllCustomProviderMetadata(): Promise<Array<CustomProviderMetadata>>;
    getAllProviders(): Promise<Array<ProviderInfo>>;
    getAllUsersCustomProviderMetadata(): Promise<Array<[Principal, Array<CustomProviderMetadata>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUser(): Promise<Principal>;
    getCustomProviderMetadata(providerKey: string): Promise<CustomProviderMetadata | null>;
    getProviderInfo(provider: string): Promise<ProviderInfo>;
    getProviderKey(provider: string): Promise<APIKey | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeProviders(providerList: Array<ProviderInfo>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    providerKeyExists(provider: string): Promise<boolean>;
    setCustomProviderMetadata(providerKey: string, displayName: string): Promise<void>;
    streamChatMessages(provider: string, limit: bigint): Promise<Array<ChatMessage>>;
}

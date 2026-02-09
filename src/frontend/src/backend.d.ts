import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WorkflowRun {
    id: string;
    status: WorkflowRunStatus;
    provider: string;
    inputs: string;
    timestamp: Time;
    outputBlobId?: string;
    workflowType: string;
    durationNanos?: bigint;
}
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
export type WorkflowRunStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "success";
    success: null;
} | {
    __kind__: "failed";
    failed: string;
} | {
    __kind__: "running";
    running: null;
};
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
    executeWorkflow(provider: string, workflowType: string, inputs: string): Promise<WorkflowRun>;
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
    getWorkflowRuns(provider: string): Promise<Array<WorkflowRun>>;
    initializeProviders(providerList: Array<ProviderInfo>): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    providerKeyExists(provider: string): Promise<boolean>;
    setCustomProviderMetadata(providerKey: string, displayName: string): Promise<void>;
    streamChatMessages(provider: string, limit: bigint): Promise<Array<ChatMessage>>;
    updateWorkflowRun(runId: string, status: WorkflowRunStatus, outputBlobId: string | null, durationNanos: bigint | null): Promise<WorkflowRun>;
}

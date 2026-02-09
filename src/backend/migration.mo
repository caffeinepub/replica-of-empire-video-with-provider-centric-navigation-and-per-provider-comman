import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type APIKey = {
    provider : Text;
    key : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type CustomProviderMetadata = {
    displayName : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type ProviderInfo = {
    name : Text;
    apiEndpoint : Text;
    documentationLink : Text;
    version : Text;
    author : Text;
  };

  type ChatMessage = {
    fromSystem : Bool;
    content : Text;
    provider : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    providers : Map.Map<Text, ProviderInfo>;
    customProviderMetadata : Map.Map<Principal, Map.Map<Text, CustomProviderMetadata>>;
    userAPIKeys : Map.Map<Principal, Map.Map<Text, APIKey>>;
    chatHistory : Map.Map<Principal, Map.Map<Text, List.List<ChatMessage>>>;
  };

  type WorkflowRunStatus = {
    #pending;
    #running;
    #success;
    #failed : Text;
  };

  type WorkflowRun = {
    id : Text;
    provider : Text;
    workflowType : Text;
    status : WorkflowRunStatus;
    inputs : Text;
    outputBlobId : ?Text;
    timestamp : Time.Time;
    durationNanos : ?Int;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    providers : Map.Map<Text, ProviderInfo>;
    customProviderMetadata : Map.Map<Principal, Map.Map<Text, CustomProviderMetadata>>;
    userAPIKeys : Map.Map<Principal, Map.Map<Text, APIKey>>;
    chatHistory : Map.Map<Principal, Map.Map<Text, List.List<ChatMessage>>>;
    workflowRuns : Map.Map<Principal, Map.Map<Text, List.List<WorkflowRun>>>;
    nextWorkflowRunId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      workflowRuns = Map.empty<Principal, Map.Map<Text, List.List<WorkflowRun>>>();
      nextWorkflowRunId = 0;
    };
  };
};


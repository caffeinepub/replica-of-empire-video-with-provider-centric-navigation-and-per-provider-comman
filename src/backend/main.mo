import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Key Management Types
  public type APIKey = {
    provider : Text;
    key : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module APIKey {
    public func compare(key1 : APIKey, key2 : APIKey) : Order.Order {
      Text.compare(key1.provider, key2.provider);
    };
  };

  type CustomProviderMetadata = {
    displayName : Text;
  };

  // Basic authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  // Provider Management
  public type ProviderInfo = {
    name : Text;
    apiEndpoint : Text;
    documentationLink : Text;
    version : Text;
    author : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let providers = Map.empty<Text, ProviderInfo>();
  let customProviderMetadata = Map.empty<Principal, Map.Map<Text, CustomProviderMetadata>>();

  // Initialize Providers
  public shared ({ caller }) func initializeProviders(providerList : [ProviderInfo]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can initialize providers.");
    };
    for (provider in providerList.values()) {
      providers.add(provider.name, provider);
    };
  };

  public query ({ caller }) func getAllProviders() : async [ProviderInfo] {
    providers.values().toArray();
  };

  public query ({ caller }) func getProviderInfo(provider : Text) : async ProviderInfo {
    switch (providers.get(provider)) {
      case (null) { Runtime.trap("Provider does not exist") };
      case (?info) { info };
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Custom Provider Management per User
  public shared ({ caller }) func setCustomProviderMetadata(providerKey : Text, displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage custom providers");
    };

    let metadata : CustomProviderMetadata = {
      displayName;
    };

    // Get or create user's metadata map
    let userMetadata = switch (customProviderMetadata.get(caller)) {
      case (?metadata) { metadata };
      case null {
        let newMap = Map.empty<Text, CustomProviderMetadata>();
        customProviderMetadata.add(caller, newMap);
        newMap;
      };
    };
    userMetadata.add(providerKey, metadata);
  };

  public query ({ caller }) func getCustomProviderMetadata(providerKey : Text) : async ?CustomProviderMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access custom provider metadata");
    };

    switch (customProviderMetadata.get(caller)) {
      case (?userMetadata) { userMetadata.get(providerKey) };
      case null { null };
    };
  };

  public query ({ caller }) func customProviderMetadataExists(providerKey : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check custom provider metadata");
    };

    switch (customProviderMetadata.get(caller)) {
      case (?userMetadata) { userMetadata.containsKey(providerKey) };
      case null { false };
    };
  };

  public query ({ caller }) func getAllCustomProviderMetadata() : async [CustomProviderMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (customProviderMetadata.get(caller)) {
      case (?userMetadata) { userMetadata.values().toArray() };
      case null { [] };
    };
  };

  public query ({ caller }) func getAllUsersCustomProviderMetadata() : async [(Principal, [CustomProviderMetadata])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let result = customProviderMetadata.entries().toArray().map(
      func((principal, metadataMap)) : (Principal, [CustomProviderMetadata]) {
        (principal, metadataMap.values().toArray())
      }
    );
    result;
  };

  // API Key Management - Per User
  let userAPIKeys = Map.empty<Principal, Map.Map<Text, APIKey>>();

  public shared ({ caller }) func addOrUpdateAPIKey(provider : Text, key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage API keys");
    };

    let now = Time.now();
    if (key.size() < 10) {
      Runtime.trap("API key invalid. Key seems too short.");
    };

    let apiKeyEntry : APIKey = {
      provider;
      key;
      createdAt = now;
      updatedAt = now;
    };

    // Get or create user's key map
    let userKeys = switch (userAPIKeys.get(caller)) {
      case (?keys) { keys };
      case null {
        let newMap = Map.empty<Text, APIKey>();
        userAPIKeys.add(caller, newMap);
        newMap;
      };
    };
    userKeys.add(provider, apiKeyEntry);
  };

  public query ({ caller }) func getProviderKey(provider : Text) : async ?APIKey {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access API keys");
    };

    switch (userAPIKeys.get(caller)) {
      case (?userKeys) { userKeys.get(provider) };
      case null { null };
    };
  };

  public query ({ caller }) func providerKeyExists(provider : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check API keys");
    };

    switch (userAPIKeys.get(caller)) {
      case (?userKeys) { userKeys.containsKey(provider) };
      case null { false };
    };
  };

  public query ({ caller }) func getAllAPIKeys() : async [(Principal, [APIKey])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let result = userAPIKeys.entries().toArray().map(
      func((principal, keysMap)) : (Principal, [APIKey]) {
        (principal, keysMap.values().toArray().sort())
      }
    );
    result;
  };

  // Chat Functionalities
  public type ChatMessage = {
    fromSystem : Bool;
    content : Text;
    provider : Text;
    timestamp : Time.Time;
  };

  let chatHistory = Map.empty<Principal, Map.Map<Text, List.List<ChatMessage>>>();

  public shared ({ caller }) func addChatMessage(provider : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can use chat");
    };

    let message : ChatMessage = {
      fromSystem = false;
      content;
      provider;
      timestamp = Time.now();
    };

    // Get or create user's chat history
    let userHistory = switch (chatHistory.get(caller)) {
      case (?history) { history };
      case null {
        let newHistory = Map.empty<Text, List.List<ChatMessage>>();
        chatHistory.add(caller, newHistory);
        newHistory;
      };
    };

    // Get or create provider's chat messages
    let messages = switch (userHistory.get(provider)) {
      case (?msgs) { msgs };
      case null {
        let newSeq = List.empty<ChatMessage>();
        userHistory.add(provider, newSeq);
        newSeq;
      };
    };

    messages.add(message);
  };

  public query ({ caller }) func streamChatMessages(provider : Text, limit : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat messages");
    };

    switch (chatHistory.get(caller)) {
      case (?userHistory) {
        switch (userHistory.get(provider)) {
          case (?messages) {
            var currentLength = 0;
            var iter = messages.values();
            let filteredIter = iter.takeWhile(
              func(_) {
                currentLength += 1;
                currentLength <= limit;
              }
            );
            return filteredIter.toArray();
          };
          case null { return [] };
        };
      };
      case null { return [] };
    };
  };

  // Remaining functionalities can be extended here.
  // All methods should include proper authorization checks.

  include MixinStorage();

  public query ({ caller }) func getCurrentUser() : async Principal {
    caller;
  };
};

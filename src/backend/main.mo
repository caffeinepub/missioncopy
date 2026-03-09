import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  include MixinStorage();

  // Initialize mixin modules for access control and invite links
  let accessControlState = AccessControl.initState();
  let inviteState = InviteLinksModule.initState();
  include MixinAuthorization(accessControlState);

  public type Batch = {
    #batch1;
    #batch2;
    #batch3;
    #batch4;
  };

  public type Section = {
    #section1;
    #section2;
    #section3;
  };

  public type FileType = {
    #video;
    #pdf;
  };

  public type Content = {
    id : Nat;
    batch : Batch;
    section : Section;
    title : Text;
    fileType : FileType;
    fileReference : Storage.ExternalBlob;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Content {
    public func compare(content1 : Content, content2 : Content) : Order.Order {
      Nat.compare(content1.id, content2.id);
    };
    public func compareByTimestamp(content1 : Content, content2 : Content) : Order.Order {
      Int.compare(content1.timestamp, content2.timestamp);
    };
  };

  // Stable map to store content items
  var nextContentId = 0;
  let contentMap = Map.empty<Nat, Content>();

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Map to store batch information for invite codes
  let inviteCodeBatches = Map.empty<Text, Batch>();

  // Global manifest hash - admin sets after each upload, students read to load content
  var manifestHash : ?Text = null;

  // Full content list stored as JSON text - set by admin after upload/delete
  // Students read this directly so no storage gateway dependency for listing
  var contentItemsJson : Text = "[]";

  public shared func setManifestHash(hash : Text) : async () {
    manifestHash := ?hash;
  };

  public query func getManifestHash() : async ?Text {
    manifestHash;
  };

  // Store the full serialized content list in the canister
  public shared func setContentItems(json : Text) : async () {
    contentItemsJson := json;
  };

  // Students call this to get all content items as JSON
  public query func getContentItems() : async Text {
    contentItemsJson;
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};

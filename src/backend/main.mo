import Array "mo:core/Array";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type Session = {
    sessionId : Nat;
    exerciseIds : [Nat];
    completedAt : Int;
    durationSeconds : Nat;
  };

  type UserProfile = {
    streakCount : Nat;
    lastSessionDate : Int;
    weeklySessionCount : Nat;
    weeklyGoal : Nat;
    totalSessionsCompleted : Nat;
  };

  type Exercise = {
    id : Nat;
    name : Text;
    description : Text;
    duration : Nat;
    targetArea : TargetArea;
    difficulty : Difficulty;
    instructions : [Text];
    tips : Text;
  };

  type TargetArea = {
    #forehead;
    #eyes;
    #cheeks;
    #jawline;
    #neck;
    #fullFace;
  };

  type Difficulty = {
    #beginner;
    #intermediate;
    #advanced;
  };

  module Exercise {
    public func compare(exercise1 : Exercise, exercise2 : Exercise) : Order.Order {
      Int.compare(exercise1.id, exercise2.id);
    };
  };

  module Session {
    public func compare(session1 : Session, session2 : Session) : Order.Order {
      Int.compare(session1.sessionId, session2.sessionId);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userFavorites = Map.empty<Principal, List.List<Nat>>();
  let userSessions = Map.empty<Principal, List.List<Session>>();
  var nextSessionId = 1;

  // Static exercises data
  let exercises : [Exercise] = [
    {
      id = 1;
      name = "Forehead Smoother";
      description = "Helps reduce forehead wrinkles";
      duration = 60;
      targetArea = #forehead;
      difficulty = #beginner;
      instructions = ["Relax face", "Place fingers on forehead", "Gently smooth skin upwards"];
      tips = "Use light pressure";
    },
    {
      id = 2;
      name = "Eye Lifter";
      description = "Reduces puffiness around eyes";
      duration = 45;
      targetArea = #eyes;
      difficulty = #beginner;
      instructions = ["Look upwards", "Blink repeatedly", "Massage temples"];
      tips = "Be gentle near eyes";
    },
    {
      id = 3;
      name = "Cheek Plumper";
      description = "Enhances cheek volume";
      duration = 50;
      targetArea = #cheeks;
      difficulty = #beginner;
      instructions = ["Smile widely", "Hold smile", "Massage cheeks upwards"];
      tips = "Maintain even pressure";
    },
    {
      id = 4;
      name = "Jawline Definer";
      description = "Tones jaw area";
      duration = 55;
      targetArea = #jawline;
      difficulty = #intermediate;
      instructions = ["Tilt head back", "Move jaw side to side", "Massage jawline"];
      tips = "Avoid straining neck";
    },
    {
      id = 5;
      name = "Neck Firmer";
      description = "Reduces neck lines";
      duration = 65;
      targetArea = #neck;
      difficulty = #advanced;
      instructions = ["Look up", "Pout lips", "Hold position"];
      tips = "Keep shoulders relaxed";
    },
    {
      id = 6;
      name = "Full Face Workout";
      description = "Comprehensive facial routine";
      duration = 80;
      targetArea = #fullFace;
      difficulty = #advanced;
      instructions = ["Combine exercises", "Repeat sets", "Rest between"];
      tips = "Stay consistent";
    },
    {
      id = 7;
      name = "Brow Lifter";
      description = "Raises brow area";
      duration = 40;
      targetArea = #forehead;
      difficulty = #beginner;
      instructions = ["Lift brows", "Hold position", "Massage forehead"];
      tips = "Don't squint";
    },
    {
      id = 8;
      name = "Under Eye Smoother";
      description = "Reduces under-eye wrinkles";
      duration = 35;
      targetArea = #eyes;
      difficulty = #intermediate;
      instructions = ["Tap under eyes", "Gently stretch skin", "Hold for 5 seconds"];
      tips = "Use ring finger for tapping";
    },
    {
      id = 9;
      name = "Cheekbone Shaper";
      description = "Defines cheekbones";
      duration = 60;
      targetArea = #cheeks;
      difficulty = #advanced;
      instructions = ["Suck in cheeks", "Hold smile", "Massage cheekbones"];
      tips = "Don't overexert jaw";
    },
    {
      id = 10;
      name = "Double Chin Reducer";
      description = "Targets chin area";
      duration = 70;
      targetArea = #jawline;
      difficulty = #beginner;
      instructions = ["Press tongue to roof of mouth", "Look up", "Hold for 3 seconds"];
      tips = "Repeat daily";
    },
    {
      id = 11;
      name = "Neck Line Smoother";
      description = "Minimizes neck wrinkles";
      duration = 55;
      targetArea = #neck;
      difficulty = #intermediate;
      instructions = ["Tilt head back", "Pucker lips", "Hold position"];
      tips = "Maintain relaxed posture";
    },
    {
      id = 12;
      name = "Smile Line Reducer";
      description = "Softens smile lines";
      duration = 50;
      targetArea = #fullFace;
      difficulty = #beginner;
      instructions = ["Smile gently", "Massage around lips", "Hold for 5 seconds"];
      tips = "Avoid over-pulling skin";
    },
    {
      id = 13;
      name = "Forehead Wrinkle Minimizer";
      description = "Reduces horizontal lines";
      duration = 65;
      targetArea = #forehead;
      difficulty = #advanced;
      instructions = ["Relax forehead", "Smooth skin upwards", "Hold for 10 seconds"];
      tips = "Be gentle with pressure";
    },
    {
      id = 14;
      name = "Eye Bag Reducer";
      description = "Targets puffiness under eyes";
      duration = 35;
      targetArea = #eyes;
      difficulty = #intermediate;
      instructions = ["Massage under eyes", "Apply gentle pressure", "Repeat for 30 seconds"];
      tips = "Use light touch";
    },
    {
      id = 15;
      name = "Cheek Lift";
      description = "Lifts and firms cheeks";
      duration = 55;
      targetArea = #cheeks;
      difficulty = #beginner;
      instructions = ["Smile widely", "Hold smile", "Massage cheeks upwards"];
      tips = "Maintain consistent routine";
    },
    {
      id = 16;
      name = "Jawline Tightener";
      description = "Tones jaw muscles";
      duration = 60;
      targetArea = #jawline;
      difficulty = #intermediate;
      instructions = ["Tilt head back", "Move jaw side to side", "Massage jawline"];
      tips = "Focus on controlled movements";
    },
    {
      id = 17;
      name = "Neck Lift";
      description = "Firm and tone neck area";
      duration = 75;
      targetArea = #neck;
      difficulty = #advanced;
      instructions = ["Look up", "Pout lips", "Hold position"];
      tips = "Keep stress on shoulders minimal";
    },
    {
      id = 18;
      name = "Full Face Revitalizer";
      description = "Comprehensive routine for all areas";
      duration = 90;
      targetArea = #fullFace;
      difficulty = #advanced;
      instructions = ["Combine various exercises", "Repeat to cover all zones", "Rest between sets"];
      tips = "Consistency yields best results";
    },
    {
      id = 19;
      name = "Forehead Relaxer";
      description = "Smoothens forehead area";
      duration = 50;
      targetArea = #forehead;
      difficulty = #beginner;
      instructions = ["Relax face", "Gently massage forehead", "Repeat regularly"];
      tips = "Be mindful of posture";
    },
    {
      id = 20;
      name = "Eye Wrinkle Reducer";
      description = "Minimizes crow's feet and fine lines";
      duration = 45;
      targetArea = #eyes;
      difficulty = #intermediate;
      instructions = ["Gently pull skin around eyes", "Hold for 5 seconds", "Repeat several times"];
      tips = "Use gentle pressure on sensitive areas";
    },
    {
      id = 21;
      name = "Cheekbone Sculptor";
      description = "Defines cheekbone structure";
      duration = 60;
      targetArea = #cheeks;
      difficulty = #advanced;
      instructions = ["Suck in cheeks", "Hold smile", "Massage cheekbones"];
      tips = "Don't force movements";
    },
    {
      id = 22;
      name = "Jawline Strengthener";
      description = "Tones jaw and neck muscles";
      duration = 65;
      targetArea = #jawline;
      difficulty = #beginner;
      instructions = ["Press tongue to roof of mouth", "Look up", "Hold position"];
      tips = "Repeat for optimal results";
    },
    {
      id = 23;
      name = "Neck Muscle Toner";
      description = "Firms and tones neck area";
      duration = 70;
      targetArea = #neck;
      difficulty = #advanced;
      instructions = ["Tilt head back", "Pucker lips", "Hold for 10 seconds"];
      tips = "Maintain relaxed shoulders";
    },
    {
      id = 24;
      name = "Comprehensive Face Workout";
      description = "Complete routine for all facial areas";
      duration = 100;
      targetArea = #fullFace;
      difficulty = #advanced;
      instructions = ["Combine all exercises", "Repeat sets for each area", "Rest between exercises"];
      tips = "Stick to a regular schedule";
    },
    {
      id = 25;
      name = "Forehead Line Reducer";
      description = "Targets and smooths deep forehead lines";
      duration = 80;
      targetArea = #forehead;
      difficulty = #advanced;
      instructions = ["Relax face", "Smooth skin upwards", "Hold for 15 seconds"];
      tips = "Consistency is key for results";
    },
  ];

  // Helper function to create new profile
  func createNewProfile() : UserProfile {
    {
      streakCount = 0;
      lastSessionDate = 0;
      weeklySessionCount = 0;
      weeklyGoal = 5;
      totalSessionsCompleted = 0;
    };
  };

  // Public APIs

  // Exercise APIs - accessible to everyone including guests
  public query ({ caller }) func getExercises() : async [Exercise] {
    exercises;
  };

  public query ({ caller }) func getExercisesByArea(area : TargetArea) : async [Exercise] {
    exercises.filter(
      func(ex) { ex.targetArea == area }
    );
  };

  // Profile management APIs - required by frontend
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

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy API - creates profile if not exists
  public shared ({ caller }) func getUserProfileOrCreate() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile = createNewProfile();
        userProfiles.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  // Favorites APIs - user only
  public shared ({ caller }) func toggleFavorite(exerciseId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };

    let currentFavorites = switch (userFavorites.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?favs) { favs };
    };

    let contains = currentFavorites.any(func(id) { id == exerciseId });

    if (contains) {
      let newFavorites = currentFavorites.filter(func(id) { id != exerciseId });
      userFavorites.add(caller, newFavorites);
    } else {
      currentFavorites.add(exerciseId);
      userFavorites.add(caller, currentFavorites);
    };
  };

  public query ({ caller }) func getFavorites() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access favorites");
    };

    switch (userFavorites.get(caller)) {
      case (null) { [] };
      case (?favs) { favs.toArray() };
    };
  };

  // Session APIs - user only
  public shared ({ caller }) func recordSession(exerciseIds : [Nat], duration : Nat) : async Int {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record sessions");
    };

    let now = Time.now();
    let session : Session = {
      sessionId = nextSessionId;
      exerciseIds;
      completedAt = now;
      durationSeconds = duration;
    };
    nextSessionId += 1;

    // Update sessions
    let currentSessions = switch (userSessions.get(caller)) {
      case (null) { List.empty<Session>() };
      case (?sessions) { sessions };
    };
    currentSessions.add(session);
    userSessions.add(caller, currentSessions);

    // Update profile
    let profile = switch (userProfiles.get(caller)) {
      case (null) { createNewProfile() };
      case (?p) { p };
    };

    let updatedProfile = {
      profile with
      totalSessionsCompleted = profile.totalSessionsCompleted + 1;
    };
    userProfiles.add(caller, updatedProfile);

    now;
  };

  public query ({ caller }) func getSessionHistory() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access session history");
    };

    switch (userSessions.get(caller)) {
      case (null) { [] };
      case (?sessions) {
        let sessionsArray = sessions.toArray().sort();
        let len = sessionsArray.size();
        if (len <= 10) {
          return sessionsArray;
        };
        sessionsArray.sliceToArray(0, 10);
      };
    };
  };
};

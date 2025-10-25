// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint16, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateFitnessTracker is SepoliaConfig {

    address public owner;
    uint256 public totalMembers;
    uint256 public challengeCount;

    struct Member {
        address memberAddress;
        euint32 totalCaloriesBurned;
        euint16 totalWorkoutSessions;
        euint16 currentStreak;
        euint8 fitnessLevel; // 1-10 scale
        bool isActive;
        uint256 joinDate;
        string membershipType;
    }

    struct WorkoutSession {
        euint32 caloriesBurned;
        euint16 durationMinutes;
        euint8 intensityLevel; // 1-10 scale
        uint256 timestamp;
        bool completed;
    }

    struct FitnessChallenge {
        string challengeName;
        euint32 targetCalories;
        euint16 durationDays;
        uint256 startTime;
        uint256 endTime;
        uint256 prize;
        bool isActive;
        address[] participants;
        address winner;
    }

    struct MemberProgress {
        euint32 weeklyCalories;
        euint32 monthlyCalories;
        euint16 weeklyWorkouts;
        euint16 monthlyWorkouts;
        uint256 lastUpdateWeek;
        uint256 lastUpdateMonth;
    }

    mapping(address => Member) public members;
    mapping(address => mapping(uint256 => WorkoutSession)) public workoutSessions;
    mapping(address => uint256) public sessionCount;
    mapping(uint256 => FitnessChallenge) public challenges;
    mapping(uint256 => mapping(address => euint32)) public challengeProgress;
    mapping(address => MemberProgress) public memberProgress;

    event MemberRegistered(address indexed member, string membershipType);
    event WorkoutRecorded(address indexed member, uint256 sessionId);
    event ChallengeCreated(uint256 indexed challengeId, string challengeName);
    event ChallengeJoined(uint256 indexed challengeId, address indexed member);
    event ChallengeCompleted(uint256 indexed challengeId, address indexed winner);
    event ProgressUpdated(address indexed member, uint256 week, uint256 month);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender].isActive, "Only active members");
        _;
    }

    modifier validChallenge(uint256 _challengeId) {
        require(_challengeId < challengeCount, "Challenge does not exist");
        require(challenges[_challengeId].isActive, "Challenge is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalMembers = 0;
        challengeCount = 0;
    }

    // Register new fitness club member
    function registerMember(string memory _membershipType) external {
        require(!members[msg.sender].isActive, "Already registered");
        require(bytes(_membershipType).length > 0, "Invalid membership type");

        // Initialize encrypted values to zero
        euint32 initialCalories = FHE.asEuint32(0);
        euint16 initialSessions = FHE.asEuint16(0);
        euint16 initialStreak = FHE.asEuint16(0);
        euint8 initialLevel = FHE.asEuint8(1);

        members[msg.sender] = Member({
            memberAddress: msg.sender,
            totalCaloriesBurned: initialCalories,
            totalWorkoutSessions: initialSessions,
            currentStreak: initialStreak,
            fitnessLevel: initialLevel,
            isActive: true,
            joinDate: block.timestamp,
            membershipType: _membershipType
        });

        // Initialize progress tracking
        memberProgress[msg.sender] = MemberProgress({
            weeklyCalories: FHE.asEuint32(0),
            monthlyCalories: FHE.asEuint32(0),
            weeklyWorkouts: FHE.asEuint16(0),
            monthlyWorkouts: FHE.asEuint16(0),
            lastUpdateWeek: getCurrentWeek(),
            lastUpdateMonth: getCurrentMonth()
        });

        // Set ACL permissions
        FHE.allowThis(initialCalories);
        FHE.allowThis(initialSessions);
        FHE.allowThis(initialStreak);
        FHE.allowThis(initialLevel);
        FHE.allow(initialCalories, msg.sender);
        FHE.allow(initialSessions, msg.sender);
        FHE.allow(initialStreak, msg.sender);
        FHE.allow(initialLevel, msg.sender);

        totalMembers++;
        emit MemberRegistered(msg.sender, _membershipType);
    }

    // Record confidential workout session
    function recordWorkout(
        uint32 _caloriesBurned,
        uint16 _durationMinutes,
        uint8 _intensityLevel
    ) external onlyMember {
        require(_caloriesBurned > 0, "Invalid calories");
        require(_durationMinutes > 0, "Invalid duration");
        require(_intensityLevel >= 1 && _intensityLevel <= 10, "Invalid intensity level");

        // Encrypt workout data
        euint32 encryptedCalories = FHE.asEuint32(_caloriesBurned);
        euint16 encryptedDuration = FHE.asEuint16(_durationMinutes);
        euint8 encryptedIntensity = FHE.asEuint8(_intensityLevel);

        uint256 sessionId = sessionCount[msg.sender];

        workoutSessions[msg.sender][sessionId] = WorkoutSession({
            caloriesBurned: encryptedCalories,
            durationMinutes: encryptedDuration,
            intensityLevel: encryptedIntensity,
            timestamp: block.timestamp,
            completed: true
        });

        // Update member totals
        Member storage member = members[msg.sender];
        member.totalCaloriesBurned = FHE.add(member.totalCaloriesBurned, encryptedCalories);
        member.totalWorkoutSessions = FHE.add(member.totalWorkoutSessions, FHE.asEuint16(1));

        // Update progress tracking
        _updateMemberProgress(msg.sender, encryptedCalories);

        // Set ACL permissions
        FHE.allowThis(encryptedCalories);
        FHE.allowThis(encryptedDuration);
        FHE.allowThis(encryptedIntensity);
        FHE.allow(encryptedCalories, msg.sender);
        FHE.allow(encryptedDuration, msg.sender);
        FHE.allow(encryptedIntensity, msg.sender);

        sessionCount[msg.sender]++;
        emit WorkoutRecorded(msg.sender, sessionId);
    }

    // Create fitness challenge
    function createChallenge(
        string memory _challengeName,
        uint32 _targetCalories,
        uint16 _durationDays
    ) external onlyOwner payable {
        require(bytes(_challengeName).length > 0, "Invalid challenge name");
        require(_targetCalories > 0, "Invalid target calories");
        require(_durationDays > 0, "Invalid duration");

        euint32 encryptedTarget = FHE.asEuint32(_targetCalories);
        euint16 encryptedDuration = FHE.asEuint16(_durationDays);

        challenges[challengeCount] = FitnessChallenge({
            challengeName: _challengeName,
            targetCalories: encryptedTarget,
            durationDays: encryptedDuration,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationDays * 1 days),
            prize: msg.value,
            isActive: true,
            participants: new address[](0),
            winner: address(0)
        });

        FHE.allowThis(encryptedTarget);
        FHE.allowThis(encryptedDuration);

        emit ChallengeCreated(challengeCount, _challengeName);
        challengeCount++;
    }

    // Join fitness challenge
    function joinChallenge(uint256 _challengeId) external onlyMember validChallenge(_challengeId) {
        require(challenges[_challengeId].endTime > block.timestamp, "Challenge has ended");

        // Check if already joined
        address[] memory participants = challenges[_challengeId].participants;
        for(uint i = 0; i < participants.length; i++) {
            require(participants[i] != msg.sender, "Already joined this challenge");
        }

        challenges[_challengeId].participants.push(msg.sender);
        challengeProgress[_challengeId][msg.sender] = FHE.asEuint32(0);

        FHE.allowThis(challengeProgress[_challengeId][msg.sender]);
        FHE.allow(challengeProgress[_challengeId][msg.sender], msg.sender);

        emit ChallengeJoined(_challengeId, msg.sender);
    }

    // Update challenge progress
    function updateChallengeProgress(uint256 _challengeId, uint32 _calories) external onlyMember validChallenge(_challengeId) {
        require(challenges[_challengeId].endTime > block.timestamp, "Challenge has ended");

        euint32 additionalCalories = FHE.asEuint32(_calories);
        challengeProgress[_challengeId][msg.sender] = FHE.add(
            challengeProgress[_challengeId][msg.sender],
            additionalCalories
        );

        FHE.allowThis(additionalCalories);
        FHE.allow(additionalCalories, msg.sender);
    }

    // Complete challenge and find winner
    function completeChallenge(uint256 _challengeId) external onlyOwner validChallenge(_challengeId) {
        require(challenges[_challengeId].endTime <= block.timestamp, "Challenge still active");

        FitnessChallenge storage challenge = challenges[_challengeId];
        challenge.isActive = false;

        // Simple winner selection (in real implementation, would use FHE comparison)
        address winner = _findChallengeWinner(_challengeId);

        if (winner != address(0)) {
            challenge.winner = winner;
            payable(winner).transfer(challenge.prize);
            emit ChallengeCompleted(_challengeId, winner);
        }
    }

    // Update member progress tracking
    function _updateMemberProgress(address _member, euint32 _calories) private {
        MemberProgress storage progress = memberProgress[_member];
        uint256 currentWeek = getCurrentWeek();
        uint256 currentMonth = getCurrentMonth();

        // Reset weekly progress if new week
        if (progress.lastUpdateWeek != currentWeek) {
            progress.weeklyCalories = FHE.asEuint32(0);
            progress.weeklyWorkouts = FHE.asEuint16(0);
            progress.lastUpdateWeek = currentWeek;
        }

        // Reset monthly progress if new month
        if (progress.lastUpdateMonth != currentMonth) {
            progress.monthlyCalories = FHE.asEuint32(0);
            progress.monthlyWorkouts = FHE.asEuint16(0);
            progress.lastUpdateMonth = currentMonth;
        }

        // Update progress
        progress.weeklyCalories = FHE.add(progress.weeklyCalories, _calories);
        progress.monthlyCalories = FHE.add(progress.monthlyCalories, _calories);
        progress.weeklyWorkouts = FHE.add(progress.weeklyWorkouts, FHE.asEuint16(1));
        progress.monthlyWorkouts = FHE.add(progress.monthlyWorkouts, FHE.asEuint16(1));

        emit ProgressUpdated(_member, currentWeek, currentMonth);
    }

    // Simple winner selection for challenges
    function _findChallengeWinner(uint256 _challengeId) private view returns (address) {
        // Simplified implementation - in real scenario would use FHE comparison
        address[] memory participants = challenges[_challengeId].participants;
        if (participants.length > 0) {
            return participants[0]; // Placeholder logic
        }
        return address(0);
    }

    // Get current week number
    function getCurrentWeek() public view returns (uint256) {
        return block.timestamp / (7 * 24 * 60 * 60);
    }

    // Get current month number
    function getCurrentMonth() public view returns (uint256) {
        return block.timestamp / (30 * 24 * 60 * 60);
    }

    // Get member info
    function getMemberInfo(address _member) external view returns (
        bool isActive,
        uint256 joinDate,
        string memory membershipType,
        uint256 sessions
    ) {
        Member storage member = members[_member];
        return (
            member.isActive,
            member.joinDate,
            member.membershipType,
            sessionCount[_member]
        );
    }

    // Get challenge info
    function getChallengeInfo(uint256 _challengeId) external view returns (
        string memory challengeName,
        uint256 startTime,
        uint256 endTime,
        uint256 prize,
        bool isActive,
        uint256 participantCount
    ) {
        require(_challengeId < challengeCount, "Challenge does not exist");
        FitnessChallenge storage challenge = challenges[_challengeId];
        return (
            challenge.challengeName,
            challenge.startTime,
            challenge.endTime,
            challenge.prize,
            challenge.isActive,
            challenge.participants.length
        );
    }

    // Get member's workout session (encrypted data)
    function getWorkoutSession(address _member, uint256 _sessionId) external view returns (
        uint256 timestamp,
        bool completed
    ) {
        require(_sessionId < sessionCount[_member], "Session does not exist");
        WorkoutSession storage session = workoutSessions[_member][_sessionId];
        return (
            session.timestamp,
            session.completed
        );
    }

    // Deactivate membership
    function deactivateMember(address _member) external onlyOwner {
        require(members[_member].isActive, "Member not active");
        members[_member].isActive = false;
        totalMembers--;
    }

    // Update fitness level
    function updateFitnessLevel(uint8 _newLevel) external onlyMember {
        require(_newLevel >= 1 && _newLevel <= 10, "Invalid fitness level");
        euint8 encryptedLevel = FHE.asEuint8(_newLevel);
        members[msg.sender].fitnessLevel = encryptedLevel;

        FHE.allowThis(encryptedLevel);
        FHE.allow(encryptedLevel, msg.sender);
    }

    // Emergency functions
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function changeOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
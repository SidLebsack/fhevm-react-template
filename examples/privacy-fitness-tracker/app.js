// Private Fitness Tracker DApp
let provider;
let signer;
let contract;
let userAddress;

// Contract configuration - Update this with your deployed contract address
const CONTRACT_ADDRESS = "0x6Bbf52494089ce94859414D82d03f7c8a4cF1844";
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function totalMembers() view returns (uint256)",
    "function challengeCount() view returns (uint256)",
    "function registerMember(string _membershipType)",
    "function recordWorkout(uint32 _caloriesBurned, uint16 _durationMinutes, uint8 _intensityLevel)",
    "function createChallenge(string _challengeName, uint32 _targetCalories, uint16 _durationDays) payable",
    "function joinChallenge(uint256 _challengeId)",
    "function updateFitnessLevel(uint8 _newLevel)",
    "function getMemberInfo(address _member) view returns (bool, uint256, string, uint256)",
    "function getChallengeInfo(uint256 _challengeId) view returns (string, uint256, uint256, uint256, bool, uint256)",
    "function members(address) view returns (address, uint256, bool, uint256, string)",
    "event MemberRegistered(address indexed member, string membershipType)",
    "event WorkoutRecorded(address indexed member, uint256 sessionId)",
    "event ChallengeCreated(uint256 indexed challengeId, string challengeName)",
    "event ChallengeJoined(uint256 indexed challengeId, address indexed member)"
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    showStatus("Welcome to Privacy Fitness Club! Connect your wallet to get started.", "info");

    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showStatus("Please install MetaMask to use this application.", "error");
        return;
    }

    // Check if already connected
    if (window.ethereum.selectedAddress) {
        connectWallet();
    }
}

function setupEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Member functions
    document.getElementById('registerMember').addEventListener('click', registerMember);
    document.getElementById('recordWorkout').addEventListener('click', recordWorkout);
    document.getElementById('updateFitnessLevel').addEventListener('click', updateFitnessLevel);

    // Challenge functions
    document.getElementById('createChallenge').addEventListener('click', createChallenge);
    document.getElementById('joinChallenge').addEventListener('click', joinChallenge);
    document.getElementById('viewChallenges').addEventListener('click', loadChallenges);

    // Stats
    document.getElementById('loadStats').addEventListener('click', loadContractStats);

    // MetaMask event listeners
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

async function connectWallet() {
    try {
        showStatus("Connecting to wallet...", "info");

        if (typeof window.ethereum === 'undefined') {
            throw new Error("MetaMask is not installed");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error("No accounts found");
        }

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = accounts[0];

        // Get network info
        const network = await provider.getNetwork();

        // Initialize contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        document.getElementById('walletAddress').textContent =
            userAddress.substring(0, 6) + '...' + userAddress.substring(userAddress.length - 4);
        document.getElementById('networkName').textContent = network.name;
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('connectWallet').textContent = 'Connected';
        document.getElementById('connectWallet').disabled = true;

        showStatus("Wallet connected successfully! You can now interact with the fitness club.", "success");

        // Load member info and stats
        await loadMemberInfo();
        await loadContractStats();

    } catch (error) {
        console.error('Wallet connection failed:', error);
        showStatus(`Connection failed: ${error.message}`, "error");
    }
}

async function registerMember() {
    try {
        const membershipType = document.getElementById('membershipType').value;

        if (!membershipType) {
            throw new Error("Please select a membership type");
        }

        if (!contract) {
            throw new Error("Please connect your wallet first");
        }

        showStatus("Registering member... Please confirm transaction.", "info");

        const tx = await contract.registerMember(membershipType);
        showStatus("Transaction submitted. Waiting for confirmation...", "info");

        const receipt = await tx.wait();
        showStatus("Member registered successfully! Welcome to Privacy Fitness Club! 🎉", "success");

        // Reload member info
        await loadMemberInfo();
        await loadContractStats();

    } catch (error) {
        console.error('Registration failed:', error);
        showStatus(`Registration failed: ${error.message}`, "error");
    }
}

async function recordWorkout() {
    try {
        const calories = document.getElementById('caloriesBurned').value;
        const duration = document.getElementById('workoutDuration').value;
        const intensity = document.getElementById('intensityLevel').value;

        if (!calories || !duration || !intensity) {
            throw new Error("Please fill in all workout details");
        }

        if (calories < 1 || calories > 2000) {
            throw new Error("Calories must be between 1 and 2000");
        }

        if (duration < 1 || duration > 300) {
            throw new Error("Duration must be between 1 and 300 minutes");
        }

        if (!contract) {
            throw new Error("Please connect your wallet first");
        }

        showStatus("Recording workout... Your data will be encrypted for privacy.", "info");

        const tx = await contract.recordWorkout(
            parseInt(calories),
            parseInt(duration),
            parseInt(intensity)
        );

        showStatus("Transaction submitted. Waiting for confirmation...", "info");

        const receipt = await tx.wait();
        showStatus("Workout recorded successfully! Your data is encrypted and confidential. 💪", "success");

        // Clear form
        document.getElementById('caloriesBurned').value = '';
        document.getElementById('workoutDuration').value = '';
        document.getElementById('intensityLevel').value = '';

        // Reload member info
        await loadMemberInfo();

    } catch (error) {
        console.error('Workout recording failed:', error);
        showStatus(`Recording failed: ${error.message}`, "error");
    }
}

async function createChallenge() {
    try {
        const name = document.getElementById('challengeName').value;
        const targetCalories = document.getElementById('targetCalories').value;
        const duration = document.getElementById('challengeDuration').value;
        const prize = document.getElementById('prizeMoney').value;

        if (!name || !targetCalories || !duration) {
            throw new Error("Please fill in all challenge details");
        }

        if (!contract) {
            throw new Error("Please connect your wallet first");
        }

        const prizeInWei = prize ? ethers.utils.parseEther(prize) : 0;

        showStatus("Creating challenge... Please confirm transaction.", "info");

        const tx = await contract.createChallenge(
            name,
            parseInt(targetCalories),
            parseInt(duration),
            { value: prizeInWei }
        );

        showStatus("Transaction submitted. Waiting for confirmation...", "info");

        const receipt = await tx.wait();
        showStatus("Challenge created successfully! Members can now join. 🏆", "success");

        // Clear form
        document.getElementById('challengeName').value = '';
        document.getElementById('targetCalories').value = '';
        document.getElementById('challengeDuration').value = '';
        document.getElementById('prizeMoney').value = '';

        // Reload challenges and stats
        await loadChallenges();
        await loadContractStats();

    } catch (error) {
        console.error('Challenge creation failed:', error);
        showStatus(`Challenge creation failed: ${error.message}`, "error");
    }
}

async function joinChallenge() {
    try {
        const challengeId = document.getElementById('challengeId').value;

        if (!challengeId) {
            throw new Error("Please enter a challenge ID");
        }

        if (!contract) {
            throw new Error("Please connect your wallet first");
        }

        showStatus("Joining challenge... Please confirm transaction.", "info");

        const tx = await contract.joinChallenge(parseInt(challengeId));
        showStatus("Transaction submitted. Waiting for confirmation...", "info");

        const receipt = await tx.wait();
        showStatus("Successfully joined challenge! Good luck! 🎯", "success");

        document.getElementById('challengeId').value = '';

    } catch (error) {
        console.error('Joining challenge failed:', error);
        showStatus(`Joining challenge failed: ${error.message}`, "error");
    }
}

async function updateFitnessLevel() {
    try {
        const newLevel = document.getElementById('newFitnessLevel').value;

        if (!newLevel) {
            throw new Error("Please select a fitness level");
        }

        if (!contract) {
            throw new Error("Please connect your wallet first");
        }

        showStatus("Updating fitness level... Please confirm transaction.", "info");

        const tx = await contract.updateFitnessLevel(parseInt(newLevel));
        showStatus("Transaction submitted. Waiting for confirmation...", "info");

        const receipt = await tx.wait();
        showStatus("Fitness level updated successfully! 💪", "success");

        document.getElementById('newFitnessLevel').value = '';

    } catch (error) {
        console.error('Fitness level update failed:', error);
        showStatus(`Update failed: ${error.message}`, "error");
    }
}

async function loadMemberInfo() {
    try {
        if (!contract || !userAddress) return;

        const memberInfo = await contract.getMemberInfo(userAddress);
        const [isActive, joinDate, membershipType, sessionCount] = memberInfo;

        if (isActive) {
            document.getElementById('memberInfo').classList.remove('hidden');
            document.getElementById('memberStatus').textContent = 'Active';
            document.getElementById('joinDate').textContent = new Date(joinDate * 1000).toLocaleDateString();
            document.getElementById('membershipDisplay').textContent = membershipType;
            document.getElementById('totalSessions').textContent = sessionCount.toString();
        } else {
            document.getElementById('memberInfo').classList.add('hidden');
        }

    } catch (error) {
        console.error('Loading member info failed:', error);
        // Member might not be registered yet, which is fine
    }
}

async function loadContractStats() {
    try {
        if (!contract) return;

        const totalMembers = await contract.totalMembers();
        const challengeCount = await contract.challengeCount();
        const owner = await contract.owner();

        document.getElementById('totalMembers').textContent = totalMembers.toString();
        document.getElementById('activeChallenges').textContent = challengeCount.toString();
        document.getElementById('contractOwner').textContent =
            owner.substring(0, 6) + '...' + owner.substring(owner.length - 4);

    } catch (error) {
        console.error('Loading contract stats failed:', error);
        showStatus("Failed to load contract statistics", "error");
    }
}

async function loadChallenges() {
    try {
        if (!contract) return;

        showStatus("Loading challenges...", "info");

        const challengeCount = await contract.challengeCount();
        const challengesList = document.getElementById('challengesList');
        challengesList.innerHTML = '';

        if (challengeCount.eq(0)) {
            challengesList.innerHTML = '<p>No challenges created yet. Be the first to create one!</p>';
            return;
        }

        for (let i = 0; i < challengeCount; i++) {
            try {
                const challengeInfo = await contract.getChallengeInfo(i);
                const [name, startTime, endTime, prize, isActive, participantCount] = challengeInfo;

                const challengeDiv = document.createElement('div');
                challengeDiv.className = 'challenge-item';
                challengeDiv.innerHTML = `
                    <h5>Challenge #${i}: ${name}</h5>
                    <p><strong>Status:</strong> ${isActive ? 'Active' : 'Ended'}</p>
                    <p><strong>Prize:</strong> ${ethers.utils.formatEther(prize)} ETH</p>
                    <p><strong>Participants:</strong> ${participantCount}</p>
                    <p><strong>End Date:</strong> ${new Date(endTime * 1000).toLocaleDateString()}</p>
                `;

                challengesList.appendChild(challengeDiv);
            } catch (error) {
                console.error(`Error loading challenge ${i}:`, error);
            }
        }

        showStatus("Challenges loaded successfully!", "success");

    } catch (error) {
        console.error('Loading challenges failed:', error);
        showStatus("Failed to load challenges", "error");
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        showStatus("Please connect your wallet", "info");
        location.reload();
    } else if (accounts[0] !== userAddress) {
        showStatus("Account changed. Refreshing...", "info");
        location.reload();
    }
}

function handleChainChanged(chainId) {
    showStatus("Network changed. Refreshing...", "info");
    location.reload();
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusDiv');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;

    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (statusDiv.innerHTML.includes(message)) {
                statusDiv.innerHTML = '';
            }
        }, 5000);
    }
}

// Utility function to format Ethereum addresses
function formatAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Utility function to format timestamps
function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

// Auto-refresh data every 30 seconds
setInterval(async () => {
    if (contract && userAddress) {
        await loadMemberInfo();
        await loadContractStats();
    }
}, 30000);
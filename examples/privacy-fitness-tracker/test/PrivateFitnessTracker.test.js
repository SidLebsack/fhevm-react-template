const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateFitnessTracker", function () {
  let contract;
  let owner;
  let member1;
  let member2;

  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();

    const PrivateFitnessTracker = await ethers.getContractFactory("PrivateFitnessTracker");
    contract = await PrivateFitnessTracker.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero members and challenges", async function () {
      expect(await contract.totalMembers()).to.equal(0);
      expect(await contract.challengeCount()).to.equal(0);
    });
  });

  describe("Member Registration", function () {
    it("Should allow member registration", async function () {
      await expect(contract.connect(member1).registerMember("Premium"))
        .to.emit(contract, "MemberRegistered")
        .withArgs(member1.address, "Premium");

      const memberInfo = await contract.getMemberInfo(member1.address);
      expect(memberInfo.isActive).to.be.true;
      expect(memberInfo.membershipType).to.equal("Premium");
    });

    it("Should increment total members on registration", async function () {
      await contract.connect(member1).registerMember("Basic");
      expect(await contract.totalMembers()).to.equal(1);

      await contract.connect(member2).registerMember("Elite");
      expect(await contract.totalMembers()).to.equal(2);
    });

    it("Should reject duplicate registration", async function () {
      await contract.connect(member1).registerMember("Premium");

      await expect(
        contract.connect(member1).registerMember("Elite")
      ).to.be.revertedWith("Already registered");
    });

    it("Should reject empty membership type", async function () {
      await expect(
        contract.connect(member1).registerMember("")
      ).to.be.revertedWith("Invalid membership type");
    });
  });

  describe("Workout Recording", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow member to record workout", async function () {
      await expect(contract.connect(member1).recordWorkout(500, 60, 7))
        .to.emit(contract, "WorkoutRecorded")
        .withArgs(member1.address, 0);

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(1);
    });

    it("Should increment session count on each workout", async function () {
      await contract.connect(member1).recordWorkout(500, 60, 7);
      await contract.connect(member1).recordWorkout(300, 45, 5);
      await contract.connect(member1).recordWorkout(700, 90, 9);

      const sessionCount = await contract.sessionCount(member1.address);
      expect(sessionCount).to.equal(3);
    });

    it("Should reject workout from non-member", async function () {
      await expect(
        contract.connect(member2).recordWorkout(500, 60, 7)
      ).to.be.revertedWith("Only active members");
    });

    it("Should reject invalid calories", async function () {
      await expect(
        contract.connect(member1).recordWorkout(0, 60, 7)
      ).to.be.revertedWith("Invalid calories");
    });

    it("Should reject invalid duration", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 0, 7)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should reject invalid intensity (too low)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 60, 0)
      ).to.be.revertedWith("Invalid intensity level");
    });

    it("Should reject invalid intensity (too high)", async function () {
      await expect(
        contract.connect(member1).recordWorkout(500, 60, 11)
      ).to.be.revertedWith("Invalid intensity level");
    });

    it("Should accept valid intensity range (1-10)", async function () {
      await expect(contract.connect(member1).recordWorkout(500, 60, 1))
        .to.not.be.reverted;
      await expect(contract.connect(member1).recordWorkout(500, 60, 10))
        .to.not.be.reverted;
    });
  });

  describe("Challenge Management", function () {
    it("Should allow owner to create challenge", async function () {
      const prizeAmount = ethers.parseEther("0.1");

      await expect(
        contract.createChallenge("Summer Challenge", 10000, 30, {
          value: prizeAmount
        })
      )
        .to.emit(contract, "ChallengeCreated")
        .withArgs(0, "Summer Challenge");

      expect(await contract.challengeCount()).to.equal(1);
    });

    it("Should reject challenge creation from non-owner", async function () {
      await expect(
        contract.connect(member1).createChallenge("Challenge", 10000, 30)
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should reject empty challenge name", async function () {
      await expect(
        contract.createChallenge("", 10000, 30)
      ).to.be.revertedWith("Invalid challenge name");
    });

    it("Should reject zero target calories", async function () {
      await expect(
        contract.createChallenge("Challenge", 0, 30)
      ).to.be.revertedWith("Invalid target calories");
    });

    it("Should reject zero duration", async function () {
      await expect(
        contract.createChallenge("Challenge", 10000, 0)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should allow member to join challenge", async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.createChallenge("Challenge", 10000, 30);

      await expect(contract.connect(member1).joinChallenge(0))
        .to.emit(contract, "ChallengeJoined")
        .withArgs(0, member1.address);
    });

    it("Should reject non-member joining challenge", async function () {
      await contract.createChallenge("Challenge", 10000, 30);

      await expect(
        contract.connect(member1).joinChallenge(0)
      ).to.be.revertedWith("Only active members");
    });

    it("Should reject duplicate challenge join", async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.createChallenge("Challenge", 10000, 30);

      await contract.connect(member1).joinChallenge(0);

      await expect(
        contract.connect(member1).joinChallenge(0)
      ).to.be.revertedWith("Already joined this challenge");
    });
  });

  describe("Fitness Level", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow member to update fitness level", async function () {
      await expect(contract.connect(member1).updateFitnessLevel(8))
        .to.not.be.reverted;
    });

    it("Should reject fitness level from non-member", async function () {
      await expect(
        contract.connect(member2).updateFitnessLevel(5)
      ).to.be.revertedWith("Only active members");
    });

    it("Should reject invalid fitness level (too low)", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(0)
      ).to.be.revertedWith("Invalid fitness level");
    });

    it("Should reject invalid fitness level (too high)", async function () {
      await expect(
        contract.connect(member1).updateFitnessLevel(11)
      ).to.be.revertedWith("Invalid fitness level");
    });

    it("Should accept valid fitness level range (1-10)", async function () {
      await expect(contract.connect(member1).updateFitnessLevel(1))
        .to.not.be.reverted;
      await expect(contract.connect(member1).updateFitnessLevel(10))
        .to.not.be.reverted;
    });
  });

  describe("Owner Functions", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
    });

    it("Should allow owner to deactivate member", async function () {
      await contract.deactivateMember(member1.address);

      const memberInfo = await contract.getMemberInfo(member1.address);
      expect(memberInfo.isActive).to.be.false;
    });

    it("Should reject member deactivation from non-owner", async function () {
      await expect(
        contract.connect(member2).deactivateMember(member1.address)
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should allow owner to change ownership", async function () {
      await contract.changeOwner(member1.address);
      expect(await contract.owner()).to.equal(member1.address);
    });

    it("Should reject ownership change from non-owner", async function () {
      await expect(
        contract.connect(member1).changeOwner(member2.address)
      ).to.be.revertedWith("Only owner can execute");
    });

    it("Should reject ownership change to zero address", async function () {
      await expect(
        contract.changeOwner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should allow owner to withdraw funds", async function () {
      // Send some ETH to contract
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      await contract.withdrawFunds();

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(member1).registerMember("Premium");
      await contract.connect(member1).recordWorkout(500, 60, 7);
    });

    it("Should return correct member info", async function () {
      const info = await contract.getMemberInfo(member1.address);

      expect(info.isActive).to.be.true;
      expect(info.membershipType).to.equal("Premium");
      expect(info.sessions).to.equal(1);
    });

    it("Should return correct workout session info", async function () {
      const session = await contract.getWorkoutSession(member1.address, 0);

      expect(session.completed).to.be.true;
      expect(session.timestamp).to.be.gt(0);
    });

    it("Should return current week and month", async function () {
      const currentWeek = await contract.getCurrentWeek();
      const currentMonth = await contract.getCurrentMonth();

      expect(currentWeek).to.be.gt(0);
      expect(currentMonth).to.be.gt(0);
    });
  });
});

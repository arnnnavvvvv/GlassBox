const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GlassBox", function () {
  async function deploy() {
    const GlassBox = await ethers.getContractFactory("GlassBox");
    const glassBox = await GlassBox.deploy();
    await glassBox.waitForDeployment();
    return glassBox;
  }

  it("registers a policy and emits PolicyRegistered", async function () {
    const glassBox = await deploy();
    const policyHash = ethers.keccak256(ethers.toUtf8Bytes("risk_v1"));

    await expect(glassBox.registerPolicy(policyHash)).to.emit(glassBox, "PolicyRegistered");

    const registeredAt = await glassBox.policyRegisteredAt(policyHash);
    expect(registeredAt).to.be.greaterThan(0n);
  });

  it("commits a decision, assigns sequential ids, and stores it permanently", async function () {
    const glassBox = await deploy();
    const decisionHash = ethers.keccak256(ethers.toUtf8Bytes("decision-1"));

    await expect(glassBox.commitDecision(decisionHash, "trading-agent-1", 1)).to.emit(
      glassBox,
      "DecisionCommitted"
    );

    const record = await glassBox.decisions(0);
    expect(record.decisionHash).to.equal(decisionHash);
    expect(record.agentId).to.equal("trading-agent-1");
    expect(record.verdict).to.equal(1n);
    expect(await glassBox.decisionCount()).to.equal(1n);
  });

  it("rejects an invalid verdict value", async function () {
    const glassBox = await deploy();
    const decisionHash = ethers.keccak256(ethers.toUtf8Bytes("decision-2"));

    await expect(glassBox.commitDecision(decisionHash, "trading-agent-1", 2)).to.be.revertedWith(
      "GlassBox: invalid verdict"
    );
  });
});

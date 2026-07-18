// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GlassBox
/// @notice Append-only onchain registry of trading-agent decisions and their
///         independent risk-agent verdicts. Anyone with this contract's
///         address and ABI can read every commit directly, without trusting
///         any offchain database.
/// @dev Only two mutating functions exist: registerPolicy and commitDecision.
///      There is no update or delete function, and none should ever be added.
contract GlassBox {
    struct DecisionRecord {
        bytes32 decisionHash;
        string agentId;
        uint8 verdict; // 0 = rejected, 1 = approved
        uint256 timestamp;
        address committer;
    }

    /// policyHash => registration timestamp (0 if never registered)
    mapping(bytes32 => uint256) public policyRegisteredAt;

    /// sequential id => decision record
    mapping(uint256 => DecisionRecord) public decisions;

    uint256 public decisionCount;

    event PolicyRegistered(bytes32 indexed policyHash, uint256 timestamp);

    event DecisionCommitted(
        uint256 indexed id,
        bytes32 indexed decisionHash,
        string agentId,
        uint8 verdict,
        uint256 timestamp,
        address indexed committer
    );

    /// @notice Marks a risk policy version as active. Called once per policy version.
    function registerPolicy(bytes32 policyHash) external {
        policyRegisteredAt[policyHash] = block.timestamp;
        emit PolicyRegistered(policyHash, block.timestamp);
    }

    /// @notice Append-only commit of one trade decision + risk verdict.
    /// @return id the sequential index this decision was stored under, for later lookup.
    function commitDecision(
        bytes32 decisionHash,
        string calldata agentId,
        uint8 verdict
    ) external returns (uint256 id) {
        require(verdict <= 1, "GlassBox: invalid verdict");

        id = decisionCount;
        decisions[id] = DecisionRecord({
            decisionHash: decisionHash,
            agentId: agentId,
            verdict: verdict,
            timestamp: block.timestamp,
            committer: msg.sender
        });
        decisionCount = id + 1;

        emit DecisionCommitted(id, decisionHash, agentId, verdict, block.timestamp, msg.sender);
    }
}

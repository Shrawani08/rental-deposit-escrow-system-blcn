// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RentalEscrow
 * @dev Blockchain-Based Rental Deposit Escrow and Dispute Settlement System.
 * Securely holds rental security deposits and transparently manages release, deductions,
 * move-in/move-out evidence integrity, and dispute resolution.
 */
contract RentalEscrow {

    enum Status {
        Created,      // 0: Agreement created by Landlord
        Funded,       // 1: Tenant deposited security funds
        Active,       // 2: Move-in evidence confirmed, lease active
        MoveOut,      // 3: Lease ended & move-out inspection submitted
        Settlement,   // 4: Landlord submitted damage claim or settlement proposed
        Disputed,     // 5: Tenant rejected claim / escalated to Arbitrator
        Closed        // 6: Funds released & escrow closed
    }

    struct Agreement {
        uint256 id;
        string propertyAddress;
        address payable landlord;
        address payable tenant;
        address arbitrator;
        uint256 depositAmount;
        uint256 monthlyRent;
        uint256 startDate;
        uint256 durationDays;
        Status status;
        
        string moveInEvidenceHash;
        string moveOutEvidenceHash;
        
        uint256 claimAmount;
        string claimReason;
        string claimEvidenceHash;
        
        uint256 counterAmount;
        string counterReason;
        
        uint256 tenantPayout;
        uint256 landlordPayout;
        uint256 createdAt;
    }

    // Default Arbitrator (Admin) address
    address public immutable defaultArbitrator;
    
    // Agreement ID tracker
    uint256 public nextAgreementId;

    // Mapping from agreement ID to Agreement struct
    mapping(uint256 => Agreement) public agreements;

    // Events
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed landlord,
        address indexed tenant,
        uint256 depositAmount,
        string propertyAddress
    );

    event DepositFunded(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount
    );

    event MoveInConfirmed(
        uint256 indexed agreementId,
        string evidenceHash
    );

    event MoveOutConfirmed(
        uint256 indexed agreementId,
        string evidenceHash
    );

    event DamageClaimSubmitted(
        uint256 indexed agreementId,
        uint256 claimAmount,
        string reason,
        string evidenceHash
    );

    event ClaimAccepted(
        uint256 indexed agreementId,
        uint256 landlordPayout,
        uint256 tenantPayout
    );

    event ClaimRejected(
        uint256 indexed agreementId,
        uint256 counterAmount,
        string reason
    );

    event DisputeRaised(
        uint256 indexed agreementId,
        address indexed raisedBy
    );

    event DisputeResolved(
        uint256 indexed agreementId,
        address indexed arbitrator,
        uint256 tenantPayout,
        uint256 landlordPayout
    );

    event DepositReleased(
        uint256 indexed agreementId,
        uint256 tenantPayout,
        uint256 landlordPayout
    );

    // Modifiers
    modifier onlyLandlord(uint256 _id) {
        require(msg.sender == agreements[_id].landlord, "RentalEscrow: Only landlord can call");
        _;
    }

    modifier onlyTenant(uint256 _id) {
        require(msg.sender == agreements[_id].tenant, "RentalEscrow: Only tenant can call");
        _;
    }

    modifier onlyParties(uint256 _id) {
        require(
            msg.sender == agreements[_id].landlord || msg.sender == agreements[_id].tenant,
            "RentalEscrow: Only landlord or tenant can call"
        );
        _;
    }

    modifier onlyArbitrator(uint256 _id) {
        require(
            msg.sender == agreements[_id].arbitrator || msg.sender == defaultArbitrator,
            "RentalEscrow: Only designated arbitrator can call"
        );
        _;
    }

    modifier inStatus(uint256 _id, Status _status) {
        require(agreements[_id].status == _status, "RentalEscrow: Invalid state for operation");
        _;
    }

    constructor() {
        defaultArbitrator = msg.sender;
        nextAgreementId = 1;
    }

    /**
     * @notice Landlord creates a new rental agreement
     */
    function createAgreement(
        address payable _tenant,
        address _arbitrator,
        uint256 _depositAmount,
        uint256 _monthlyRent,
        uint256 _durationDays,
        string memory _propertyAddress
    ) external returns (uint256) {
        require(_tenant != address(0), "RentalEscrow: Invalid tenant address");
        require(_tenant != msg.sender, "RentalEscrow: Landlord and tenant must differ");
        require(_depositAmount > 0, "RentalEscrow: Deposit must be greater than 0");

        address arb = _arbitrator == address(0) ? defaultArbitrator : _arbitrator;
        uint256 id = nextAgreementId++;

        agreements[id] = Agreement({
            id: id,
            propertyAddress: _propertyAddress,
            landlord: payable(msg.sender),
            tenant: _tenant,
            arbitrator: arb,
            depositAmount: _depositAmount,
            monthlyRent: _monthlyRent,
            startDate: 0,
            durationDays: _durationDays,
            status: Status.Created,
            moveInEvidenceHash: "",
            moveOutEvidenceHash: "",
            claimAmount: 0,
            claimReason: "",
            claimEvidenceHash: "",
            counterAmount: 0,
            counterReason: "",
            tenantPayout: 0,
            landlordPayout: 0,
            createdAt: block.timestamp
        });

        emit AgreementCreated(id, msg.sender, _tenant, _depositAmount, _propertyAddress);
        return id;
    }

    /**
     * @notice Tenant deposits the security deposit ETH into escrow vault
     */
    function fundDeposit(uint256 _id) external payable onlyTenant(_id) inStatus(_id, Status.Created) {
        Agreement storage ag = agreements[_id];
        require(msg.value == ag.depositAmount, "RentalEscrow: Incorrect ETH deposit amount");

        ag.status = Status.Funded;
        emit DepositFunded(_id, msg.sender, msg.value);
    }

    /**
     * @notice Tenant or Landlord submits move-in evidence hash and starts lease
     */
    function confirmMoveIn(uint256 _id, string memory _evidenceHash) external onlyParties(_id) inStatus(_id, Status.Funded) {
        Agreement storage ag = agreements[_id];
        ag.moveInEvidenceHash = _evidenceHash;
        ag.startDate = block.timestamp;
        ag.status = Status.Active;

        emit MoveInConfirmed(_id, _evidenceHash);
    }

    /**
     * @notice Submit move-out inspection evidence
     */
    function confirmMoveOut(uint256 _id, string memory _evidenceHash) external onlyParties(_id) inStatus(_id, Status.Active) {
        Agreement storage ag = agreements[_id];
        ag.moveOutEvidenceHash = _evidenceHash;
        ag.status = Status.MoveOut;

        emit MoveOutConfirmed(_id, _evidenceHash);
    }

    /**
     * @notice Landlord requests full refund release or submits damage claim
     */
    function submitDamageClaim(
        uint256 _id,
        uint256 _claimAmount,
        string memory _reason,
        string memory _evidenceHash
    ) external onlyLandlord(_id) {
        Agreement storage ag = agreements[_id];
        require(ag.status == Status.MoveOut || ag.status == Status.Active, "RentalEscrow: Invalid state for claim");
        require(_claimAmount <= ag.depositAmount, "RentalEscrow: Claim exceeds deposit amount");

        ag.claimAmount = _claimAmount;
        ag.claimReason = _reason;
        ag.claimEvidenceHash = _evidenceHash;

        if (_claimAmount == 0) {
            // No damage claimed: Immediate full refund to tenant!
            ag.status = Status.Closed;
            ag.tenantPayout = ag.depositAmount;
            ag.landlordPayout = 0;

            (bool sent, ) = ag.tenant.call{value: ag.depositAmount}("");
            require(sent, "RentalEscrow: ETH transfer failed");

            emit DepositReleased(_id, ag.depositAmount, 0);
        } else {
            ag.status = Status.Settlement;
            emit DamageClaimSubmitted(_id, _claimAmount, _reason, _evidenceHash);
        }
    }

    /**
     * @notice Tenant accepts the landlord's damage claim deduction
     */
    function acceptDamageClaim(uint256 _id) external onlyTenant(_id) inStatus(_id, Status.Settlement) {
        Agreement storage ag = agreements[_id];
        
        uint256 landlordShare = ag.claimAmount;
        uint256 tenantShare = ag.depositAmount - landlordShare;

        ag.status = Status.Closed;
        ag.tenantPayout = tenantShare;
        ag.landlordPayout = landlordShare;

        emit ClaimAccepted(_id, landlordShare, tenantShare);
        _executePayout(_id, tenantShare, landlordShare);
    }

    /**
     * @notice Tenant rejects landlord's claim and submits a counter offer
     */
    function rejectClaim(
        uint256 _id,
        uint256 _counterAmount,
        string memory _reason
    ) external onlyTenant(_id) inStatus(_id, Status.Settlement) {
        Agreement storage ag = agreements[_id];
        require(_counterAmount < ag.claimAmount, "RentalEscrow: Counter amount must be lower than claim");

        ag.counterAmount = _counterAmount;
        ag.counterReason = _reason;
        ag.status = Status.Disputed;

        emit ClaimRejected(_id, _counterAmount, _reason);
        emit DisputeRaised(_id, msg.sender);
    }

    /**
     * @notice Landlord accepts tenant's counter offer
     */
    function acceptCounterOffer(uint256 _id) external onlyLandlord(_id) inStatus(_id, Status.Disputed) {
        Agreement storage ag = agreements[_id];

        uint256 landlordShare = ag.counterAmount;
        uint256 tenantShare = ag.depositAmount - landlordShare;

        ag.status = Status.Closed;
        ag.tenantPayout = tenantShare;
        ag.landlordPayout = landlordShare;

        emit ClaimAccepted(_id, landlordShare, tenantShare);
        _executePayout(_id, tenantShare, landlordShare);
    }

    /**
     * @notice Arbitrator resolves a disputed agreement by splitting the escrow deposit
     */
    function resolveDispute(
        uint256 _id,
        uint256 _tenantPayout,
        uint256 _landlordPayout
    ) external onlyArbitrator(_id) inStatus(_id, Status.Disputed) {
        Agreement storage ag = agreements[_id];
        require(
            _tenantPayout + _landlordPayout == ag.depositAmount,
            "RentalEscrow: Payout sum must equal total deposit"
        );

        ag.status = Status.Closed;
        ag.tenantPayout = _tenantPayout;
        ag.landlordPayout = _landlordPayout;

        emit DisputeResolved(_id, msg.sender, _tenantPayout, _landlordPayout);
        _executePayout(_id, _tenantPayout, _landlordPayout);
    }

    /**
     * @dev Internal payout handler
     */
    function _executePayout(uint256 _id, uint256 _tenantShare, uint256 _landlordShare) internal {
        Agreement storage ag = agreements[_id];

        if (_tenantShare > 0) {
            (bool sentTenant, ) = ag.tenant.call{value: _tenantShare}("");
            require(sentTenant, "RentalEscrow: Tenant payout failed");
        }

        if (_landlordShare > 0) {
            (bool sentLandlord, ) = ag.landlord.call{value: _landlordShare}("");
            require(sentLandlord, "RentalEscrow: Landlord payout failed");
        }

        emit DepositReleased(_id, _tenantShare, _landlordShare);
    }

    /**
     * @notice Helper to get full agreement details
     */
    function getAgreement(uint256 _id) external view returns (Agreement memory) {
        return agreements[_id];
    }
}

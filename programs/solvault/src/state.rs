use anchor_lang::prelude::*;

pub const MAX_ALLOCATIONS: usize = 10;
pub const VAULT_SEED: &[u8] = b"vault";
pub const POSITION_SEED: &[u8] = b"position";

/// Minimum deposit to prevent share price manipulation (0.01 SOL)
pub const MIN_DEPOSIT_LAMPORTS: u64 = 10_000_000;
/// Maximum fee in basis points (30% = 3000 bps)
pub const MAX_FEE_BPS: u16 = 3000;
/// Basis points denominator
pub const BPS_DENOMINATOR: u64 = 10_000;
/// Initial share ratio: 1 SOL = 1_000_000_000 shares (high precision to prevent inflation attacks)
pub const SHARES_PER_SOL: u64 = 1_000_000_000;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    /// Admin authority who can update config and rebalance
    pub authority: Pubkey,
    /// Total SOL deposited into the vault (lamports)
    pub total_deposited: u64,
    /// Total shares issued to depositors
    pub total_shares: u64,
    /// Performance fee in basis points (e.g. 500 = 5%)
    pub performance_fee_bps: u16,
    /// Maximum total deposit allowed (lamports), 0 = unlimited
    pub deposit_cap: u64,
    /// Whether deposits and withdrawals are paused
    pub is_paused: bool,
    /// Number of active allocations
    pub num_allocations: u8,
    /// Target allocations across protocols
    #[max_len(MAX_ALLOCATIONS)]
    pub allocations: Vec<Allocation>,
    /// Bump for the vault PDA
    pub bump: u8,
    /// Accumulated fees available for collection (lamports)
    pub accrued_fees: u64,
    /// Timestamp of last rebalance
    pub last_rebalance_ts: i64,
    /// Total number of depositors (for stats)
    pub depositor_count: u64,
    /// Pending authority for two-step transfer (default = no pending transfer)
    pub pending_authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Allocation {
    /// Protocol identifier (0=Jito, 1=Marinade, 2=Sanctum, 3=Marginfi, 4=Kamino)
    pub protocol_id: u8,
    /// Target percentage (0-100)
    pub target_pct: u8,
    /// Current amount allocated to this protocol (lamports)
    pub current_amount: u64,
}

// ─── Events ──────────────────────────────────────────────────

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub shares_minted: u64,
    pub total_deposited: u64,
    pub total_shares: u64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub shares_burned: u64,
    pub amount_returned: u64,
    pub fee_charged: u64,
    pub total_deposited: u64,
    pub total_shares: u64,
}

#[event]
pub struct RebalanceEvent {
    pub timestamp: i64,
    pub total_deposited: u64,
    pub num_allocations: u8,
}

#[event]
pub struct ConfigUpdatedEvent {
    pub fee_bps: Option<u16>,
    pub deposit_cap: Option<u64>,
    pub paused: Option<bool>,
}

#[event]
pub struct FeeCollectedEvent {
    pub authority: Pubkey,
    pub amount: u64,
}

#[event]
pub struct AuthorityProposedEvent {
    pub current_authority: Pubkey,
    pub proposed_authority: Pubkey,
}

#[event]
pub struct AuthorityAcceptedEvent {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
}

#[event]
pub struct PositionClosedEvent {
    pub user: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct UserPosition {
    /// Owner of this position
    pub owner: Pubkey,
    /// Number of vault shares held
    pub shares: u64,
    /// Total SOL deposited (for tracking, lamports)
    pub deposited_amount: u64,
    /// Timestamp of last deposit
    pub last_deposit_ts: i64,
    /// Bump for this PDA
    pub bump: u8,
}

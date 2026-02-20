use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("The vault is currently paused")]
    VaultPaused,

    #[msg("Deposit would exceed the vault cap")]
    DepositCapExceeded,

    #[msg("Deposit amount must be greater than zero")]
    ZeroAmount,

    #[msg("Insufficient shares for withdrawal")]
    InsufficientShares,

    #[msg("Allocation percentages must sum to 100")]
    InvalidAllocations,

    #[msg("Too many allocations provided")]
    TooManyAllocations,

    #[msg("Performance fee exceeds maximum (30%)")]
    FeeTooHigh,

    #[msg("Arithmetic overflow")]
    MathOverflow,

    #[msg("Deposit below minimum amount")]
    BelowMinimumDeposit,

    #[msg("Vault has no shares outstanding")]
    NoSharesOutstanding,

    #[msg("Withdrawal would leave dust amount")]
    DustWithdrawal,

    #[msg("Operation would leave vault below rent-exempt minimum")]
    BelowRentExemption,

    #[msg("No pending authority transfer to accept")]
    NoPendingTransfer,
}

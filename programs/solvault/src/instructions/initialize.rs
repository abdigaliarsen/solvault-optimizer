use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    performance_fee_bps: u16,
    deposit_cap: u64,
    allocations: Vec<Allocation>,
) -> Result<()> {
    require!(
        performance_fee_bps <= MAX_FEE_BPS,
        VaultError::FeeTooHigh
    );
    require!(
        allocations.len() <= MAX_ALLOCATIONS,
        VaultError::TooManyAllocations
    );

    let total_pct: u16 = allocations.iter().map(|a| a.target_pct as u16).sum();
    require!(total_pct == 100, VaultError::InvalidAllocations);

    // Validate no duplicate protocol IDs
    for (i, a) in allocations.iter().enumerate() {
        for (j, b) in allocations.iter().enumerate() {
            if i != j && a.protocol_id == b.protocol_id {
                return err!(VaultError::InvalidAllocations);
            }
        }
    }

    // Zero out current_amount to prevent stale values from init args
    let mut cleaned_allocations = allocations;
    for alloc in cleaned_allocations.iter_mut() {
        alloc.current_amount = 0;
    }

    let vault = &mut ctx.accounts.vault;
    vault.authority = ctx.accounts.authority.key();
    vault.total_deposited = 0;
    vault.total_shares = 0;
    vault.performance_fee_bps = performance_fee_bps;
    vault.deposit_cap = deposit_cap;
    vault.is_paused = false;
    vault.num_allocations = cleaned_allocations.len() as u8;
    vault.allocations = cleaned_allocations;
    vault.bump = ctx.bumps.vault;
    vault.accrued_fees = 0;
    vault.last_rebalance_ts = Clock::get()?.unix_timestamp;
    vault.depositor_count = 0;
    vault.pending_authority = Pubkey::default();

    msg!("Vault initialized with {} allocations", vault.num_allocations);
    Ok(())
}

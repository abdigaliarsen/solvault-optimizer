use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct Rebalance<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn handler(ctx: Context<Rebalance>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let total = vault.total_deposited;

    if total == 0 {
        msg!("Nothing to rebalance, vault is empty");
        return Ok(());
    }

    // Compute target amounts based on allocation percentages
    // In production, this would involve CPI calls to Jito/Marinade/Sanctum
    // to actually move funds. For now, we update the bookkeeping.
    let mut allocated: u64 = 0;
    let num_allocs = vault.allocations.len();

    for (i, alloc) in vault.allocations.iter_mut().enumerate() {
        if i == num_allocs - 1 {
            // Last allocation gets the remainder to avoid rounding issues
            alloc.current_amount = total
                .checked_sub(allocated)
                .ok_or(VaultError::MathOverflow)?;
        } else {
            let target_amount: u64 = (total as u128)
                .checked_mul(alloc.target_pct as u128)
                .ok_or(VaultError::MathOverflow)?
                .checked_div(100)
                .ok_or(VaultError::MathOverflow)?
                .try_into()
                .map_err(|_| VaultError::MathOverflow)?;
            alloc.current_amount = target_amount;
            allocated = allocated
                .checked_add(target_amount)
                .ok_or(VaultError::MathOverflow)?;
        }
    }

    vault.last_rebalance_ts = Clock::get()?.unix_timestamp;

    emit!(RebalanceEvent {
        timestamp: vault.last_rebalance_ts,
        total_deposited: total,
        num_allocations: num_allocs as u8,
    });

    msg!("Rebalanced {} lamports across {} protocols", total, num_allocs);
    Ok(())
}

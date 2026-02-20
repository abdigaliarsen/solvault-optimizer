use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn handler(
    ctx: Context<UpdateConfig>,
    new_fee_bps: Option<u16>,
    new_deposit_cap: Option<u64>,
    new_paused: Option<bool>,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    if let Some(fee) = new_fee_bps {
        require!(fee <= MAX_FEE_BPS, VaultError::FeeTooHigh);
        vault.performance_fee_bps = fee;
        msg!("Updated fee to {} bps", fee);
    }

    if let Some(cap) = new_deposit_cap {
        vault.deposit_cap = cap;
        msg!("Updated deposit cap to {} lamports", cap);
    }

    if let Some(paused) = new_paused {
        vault.is_paused = paused;
        msg!("Vault paused: {}", paused);
    }

    emit!(ConfigUpdatedEvent {
        fee_bps: new_fee_bps,
        deposit_cap: new_deposit_cap,
        paused: new_paused,
    });

    Ok(())
}

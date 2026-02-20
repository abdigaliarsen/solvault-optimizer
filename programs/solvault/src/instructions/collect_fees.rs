use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn handler(ctx: Context<CollectFees>) -> Result<()> {
    let vault = &ctx.accounts.vault;
    let fee_amount = vault.accrued_fees;

    require!(fee_amount > 0, VaultError::ZeroAmount);

    // Ensure vault stays above rent-exempt minimum after transfer
    let vault_account_info = ctx.accounts.vault.to_account_info();
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(vault_account_info.data_len());
    let vault_lamports_after = vault_account_info
        .lamports()
        .checked_sub(fee_amount)
        .ok_or(VaultError::MathOverflow)?;

    // Must retain rent-exemption AND enough to cover depositor claims
    let required_minimum = min_balance
        .checked_add(vault.total_deposited)
        .ok_or(VaultError::MathOverflow)?;
    require!(
        vault_lamports_after >= required_minimum,
        VaultError::BelowRentExemption
    );

    // Transfer accrued fees from vault PDA to authority
    **vault_account_info.try_borrow_mut_lamports()? = vault_lamports_after;
    **ctx.accounts.authority.try_borrow_mut_lamports()? = ctx
        .accounts
        .authority
        .lamports()
        .checked_add(fee_amount)
        .ok_or(VaultError::MathOverflow)?;

    // Reset accrued fees
    let vault = &mut ctx.accounts.vault;
    vault.accrued_fees = 0;

    emit!(FeeCollectedEvent {
        authority: ctx.accounts.authority.key(),
        amount: fee_amount,
    });

    msg!("Collected {} lamports in fees", fee_amount);
    Ok(())
}

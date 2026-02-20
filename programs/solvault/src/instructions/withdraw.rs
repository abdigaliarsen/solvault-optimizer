use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [POSITION_SEED, user.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == user.key() @ VaultError::Unauthorized,
    )]
    pub position: Account<'info, UserPosition>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Withdraw>, shares_to_burn: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;

    require!(!vault.is_paused, VaultError::VaultPaused);
    require!(shares_to_burn > 0, VaultError::ZeroAmount);
    require!(
        ctx.accounts.position.shares >= shares_to_burn,
        VaultError::InsufficientShares
    );
    require!(vault.total_shares > 0, VaultError::NoSharesOutstanding);

    // Calculate SOL to return: amount = shares_to_burn * total_deposited / total_shares
    let withdraw_amount = calculate_withdrawal_amount(
        shares_to_burn,
        vault.total_deposited,
        vault.total_shares,
    )?;

    // Calculate performance fee on any yield
    let position = &ctx.accounts.position;
    let proportional_deposit = (position.deposited_amount as u128)
        .checked_mul(shares_to_burn as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(position.shares as u128)
        .ok_or(VaultError::MathOverflow)? as u64;

    let fee = if withdraw_amount > proportional_deposit {
        let yield_amount = withdraw_amount
            .checked_sub(proportional_deposit)
            .ok_or(VaultError::MathOverflow)?;
        (yield_amount as u128)
            .checked_mul(vault.performance_fee_bps as u128)
            .ok_or(VaultError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(VaultError::MathOverflow)? as u64
    } else {
        0
    };

    let net_amount = withdraw_amount
        .checked_sub(fee)
        .ok_or(VaultError::MathOverflow)?;

    // Check remaining shares won't leave dust
    let remaining_shares = position
        .shares
        .checked_sub(shares_to_burn)
        .ok_or(VaultError::MathOverflow)?;
    if remaining_shares > 0 {
        let remaining_value = (remaining_shares as u128)
            .checked_mul(vault.total_deposited as u128)
            .ok_or(VaultError::MathOverflow)?
            .checked_div(vault.total_shares as u128)
            .ok_or(VaultError::MathOverflow)? as u64;
        require!(
            remaining_value >= MIN_DEPOSIT_LAMPORTS,
            VaultError::DustWithdrawal
        );
    }

    // Transfer SOL from vault PDA to user
    // The vault PDA is owned by our program, so we can directly modify lamports
    let vault_account_info = ctx.accounts.vault.to_account_info();
    **vault_account_info.try_borrow_mut_lamports()? = vault_account_info
        .lamports()
        .checked_sub(net_amount)
        .ok_or(VaultError::MathOverflow)?;
    **ctx.accounts.user.try_borrow_mut_lamports()? = ctx
        .accounts
        .user
        .lamports()
        .checked_add(net_amount)
        .ok_or(VaultError::MathOverflow)?;

    // Update vault state
    let vault = &mut ctx.accounts.vault;
    vault.total_deposited = vault
        .total_deposited
        .checked_sub(withdraw_amount)
        .ok_or(VaultError::MathOverflow)?;
    vault.total_shares = vault
        .total_shares
        .checked_sub(shares_to_burn)
        .ok_or(VaultError::MathOverflow)?;
    vault.accrued_fees = vault
        .accrued_fees
        .checked_add(fee)
        .ok_or(VaultError::MathOverflow)?;

    // Update user position
    let position = &mut ctx.accounts.position;
    position.shares = remaining_shares;
    // Reduce deposited_amount proportionally
    let deposit_reduction = (position.deposited_amount as u128)
        .checked_mul(shares_to_burn as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(
            position
                .shares
                .checked_add(shares_to_burn)
                .ok_or(VaultError::MathOverflow)? as u128,
        )
        .ok_or(VaultError::MathOverflow)? as u64;
    position.deposited_amount = position
        .deposited_amount
        .checked_sub(deposit_reduction)
        .ok_or(VaultError::MathOverflow)?;

    if remaining_shares == 0 {
        vault.depositor_count = vault.depositor_count.saturating_sub(1);
    }

    msg!(
        "Withdrew {} lamports (fee: {}), burned {} shares",
        net_amount,
        fee,
        shares_to_burn
    );
    Ok(())
}

fn calculate_withdrawal_amount(
    shares_to_burn: u64,
    total_deposited: u64,
    total_shares: u64,
) -> Result<u64> {
    let amount = (shares_to_burn as u128)
        .checked_mul(total_deposited as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(total_shares as u128)
        .ok_or(VaultError::MathOverflow)?;
    Ok(amount as u64)
}

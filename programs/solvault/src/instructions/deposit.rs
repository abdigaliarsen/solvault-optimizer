use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [POSITION_SEED, user.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, UserPosition>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;

    require!(!vault.is_paused, VaultError::VaultPaused);
    require!(amount >= MIN_DEPOSIT_LAMPORTS, VaultError::BelowMinimumDeposit);

    if vault.deposit_cap > 0 {
        let new_total = vault
            .total_deposited
            .checked_add(amount)
            .ok_or(VaultError::MathOverflow)?;
        require!(new_total <= vault.deposit_cap, VaultError::DepositCapExceeded);
    }

    // Calculate shares to mint
    let shares_to_mint = calculate_shares_for_deposit(
        amount,
        vault.total_deposited,
        vault.total_shares,
    )?;

    // Transfer SOL from user to vault PDA
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update vault state
    let vault = &mut ctx.accounts.vault;
    vault.total_deposited = vault
        .total_deposited
        .checked_add(amount)
        .ok_or(VaultError::MathOverflow)?;
    vault.total_shares = vault
        .total_shares
        .checked_add(shares_to_mint)
        .ok_or(VaultError::MathOverflow)?;

    // Update user position
    let position = &mut ctx.accounts.position;
    let is_new_depositor = position.shares == 0;

    position.owner = ctx.accounts.user.key();
    position.shares = position
        .shares
        .checked_add(shares_to_mint)
        .ok_or(VaultError::MathOverflow)?;
    position.deposited_amount = position
        .deposited_amount
        .checked_add(amount)
        .ok_or(VaultError::MathOverflow)?;
    position.last_deposit_ts = Clock::get()?.unix_timestamp;
    position.bump = ctx.bumps.position;

    if is_new_depositor {
        vault.depositor_count = vault
            .depositor_count
            .checked_add(1)
            .ok_or(VaultError::MathOverflow)?;
    }

    emit!(DepositEvent {
        user: ctx.accounts.user.key(),
        amount,
        shares_minted: shares_to_mint,
        total_deposited: vault.total_deposited,
        total_shares: vault.total_shares,
    });

    msg!(
        "Deposited {} lamports, minted {} shares",
        amount,
        shares_to_mint
    );
    Ok(())
}

/// Calculate shares to mint for a given deposit amount.
/// First deposit: 1 SOL = SHARES_PER_SOL shares.
/// Subsequent: proportional to existing share/deposit ratio.
/// Rounding: integer division truncates DOWN, so the depositor receives
/// slightly fewer shares, protecting existing share holders.
fn calculate_shares_for_deposit(
    deposit_amount: u64,
    total_deposited: u64,
    total_shares: u64,
) -> Result<u64> {
    if total_shares == 0 || total_deposited == 0 {
        // First deposit: use fixed ratio for precision
        let shares = (deposit_amount as u128)
            .checked_mul(SHARES_PER_SOL as u128)
            .ok_or(VaultError::MathOverflow)?
            .checked_div(1_000_000_000) // lamports per SOL
            .ok_or(VaultError::MathOverflow)?;
        let shares: u64 = shares.try_into().map_err(|_| VaultError::MathOverflow)?;
        Ok(shares)
    } else {
        // Proportional: shares = deposit_amount * total_shares / total_deposited
        let shares = (deposit_amount as u128)
            .checked_mul(total_shares as u128)
            .ok_or(VaultError::MathOverflow)?
            .checked_div(total_deposited as u128)
            .ok_or(VaultError::MathOverflow)?;
        let shares: u64 = shares.try_into().map_err(|_| VaultError::MathOverflow)?;
        Ok(shares)
    }
}

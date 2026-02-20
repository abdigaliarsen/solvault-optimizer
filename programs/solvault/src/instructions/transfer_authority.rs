use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

// ── Step 1: Current authority proposes a new authority ──

#[derive(Accounts)]
pub struct ProposeAuthority<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn propose_handler(ctx: Context<ProposeAuthority>, new_authority: Pubkey) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.pending_authority = new_authority;

    emit!(AuthorityProposedEvent {
        current_authority: vault.authority,
        proposed_authority: new_authority,
    });

    if new_authority == Pubkey::default() {
        msg!("Pending authority transfer cancelled");
    } else {
        msg!("Authority transfer proposed to {}", new_authority);
    }
    Ok(())
}

// ── Step 2: New authority accepts the transfer ──

#[derive(Accounts)]
pub struct AcceptAuthority<'info> {
    pub new_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        constraint = vault.pending_authority == new_authority.key() @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn accept_handler(ctx: Context<AcceptAuthority>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    require!(
        vault.pending_authority != Pubkey::default(),
        VaultError::NoPendingTransfer
    );

    let old_authority = vault.authority;
    vault.authority = vault.pending_authority;
    vault.pending_authority = Pubkey::default();

    emit!(AuthorityAcceptedEvent {
        old_authority,
        new_authority: vault.authority,
    });

    msg!(
        "Authority transferred from {} to {}",
        old_authority,
        vault.authority
    );
    Ok(())
}

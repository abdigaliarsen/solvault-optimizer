use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    pub authority: Signer<'info>,

    /// CHECK: New authority, validated as non-default pubkey in handler
    pub new_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn handler(ctx: Context<TransferAuthority>) -> Result<()> {
    let new_authority = ctx.accounts.new_authority.key();
    require!(
        new_authority != Pubkey::default(),
        VaultError::Unauthorized
    );

    let vault = &mut ctx.accounts.vault;
    let old_authority = vault.authority;
    vault.authority = new_authority;

    msg!(
        "Authority transferred from {} to {}",
        old_authority,
        new_authority
    );
    Ok(())
}

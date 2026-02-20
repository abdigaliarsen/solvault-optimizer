use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateAllocations<'info> {
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
    ctx: Context<UpdateAllocations>,
    new_allocations: Vec<Allocation>,
) -> Result<()> {
    require!(
        new_allocations.len() <= MAX_ALLOCATIONS,
        VaultError::TooManyAllocations
    );
    require!(!new_allocations.is_empty(), VaultError::InvalidAllocations);

    let total_pct: u16 = new_allocations.iter().map(|a| a.target_pct as u16).sum();
    require!(total_pct == 100, VaultError::InvalidAllocations);

    // Validate no duplicate protocol IDs
    for (i, a) in new_allocations.iter().enumerate() {
        for (j, b) in new_allocations.iter().enumerate() {
            if i != j && a.protocol_id == b.protocol_id {
                return err!(VaultError::InvalidAllocations);
            }
        }
    }

    // Zero out current_amount to prevent stale bookkeeping
    let mut cleaned_allocations = new_allocations;
    for alloc in cleaned_allocations.iter_mut() {
        alloc.current_amount = 0;
    }

    let vault = &mut ctx.accounts.vault;
    vault.num_allocations = cleaned_allocations.len() as u8;
    vault.allocations = cleaned_allocations;

    msg!("Updated allocations to {} protocols", vault.num_allocations);
    Ok(())
}

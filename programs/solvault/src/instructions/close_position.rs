use anchor_lang::prelude::*;
use crate::errors::VaultError;
use crate::state::*;

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        close = user,
        seeds = [POSITION_SEED, user.key().as_ref()],
        bump = position.bump,
        constraint = position.owner == user.key() @ VaultError::Unauthorized,
        constraint = position.shares == 0 @ VaultError::InsufficientShares,
    )]
    pub position: Account<'info, UserPosition>,
}

pub fn handler(ctx: Context<ClosePosition>) -> Result<()> {
    emit!(PositionClosedEvent {
        user: ctx.accounts.user.key(),
    });

    msg!("Position closed, rent reclaimed");
    Ok(())
}

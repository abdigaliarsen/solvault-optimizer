use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::Allocation;

declare_id!("HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd");

#[program]
pub mod solvault {
    use super::*;

    /// Initialize the vault with allocation targets and fee config
    pub fn initialize(
        ctx: Context<Initialize>,
        performance_fee_bps: u16,
        deposit_cap: u64,
        allocations: Vec<Allocation>,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, performance_fee_bps, deposit_cap, allocations)
    }

    /// Deposit SOL into the vault and receive proportional shares
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }

    /// Withdraw SOL by burning vault shares
    pub fn withdraw(ctx: Context<Withdraw>, shares_to_burn: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, shares_to_burn)
    }

    /// Rebalance vault allocations toward target percentages
    pub fn rebalance(ctx: Context<Rebalance>) -> Result<()> {
        instructions::rebalance::handler(ctx)
    }

    /// Update the target allocation percentages
    pub fn update_allocations(
        ctx: Context<UpdateAllocations>,
        new_allocations: Vec<Allocation>,
    ) -> Result<()> {
        instructions::update_allocations::handler(ctx, new_allocations)
    }

    /// Update vault configuration (fee, cap, pause state)
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_fee_bps: Option<u16>,
        new_deposit_cap: Option<u64>,
        new_paused: Option<bool>,
    ) -> Result<()> {
        instructions::update_config::handler(ctx, new_fee_bps, new_deposit_cap, new_paused)
    }

    /// Collect accrued performance fees to authority
    pub fn collect_fees(ctx: Context<CollectFees>) -> Result<()> {
        instructions::collect_fees::handler(ctx)
    }

    /// Close an empty user position and reclaim rent
    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        instructions::close_position::handler(ctx)
    }

    /// Transfer vault authority to a new key
    pub fn transfer_authority(ctx: Context<TransferAuthority>) -> Result<()> {
        instructions::transfer_authority::handler(ctx)
    }
}

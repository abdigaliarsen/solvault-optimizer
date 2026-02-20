# VaultSol

Solana yield optimization vault that aggregates deposits and allocates across DeFi protocols (Jito, Marinade, Sanctum, marginfi, Kamino) to maximize SOL yield.

Built with [Anchor 0.31.1](https://www.anchor-lang.com/) and deployed on Solana devnet.

## Program

| | |
|---|---|
| **Program ID** | [`HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd`](https://explorer.solana.com/address/HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd?cluster=devnet) |
| **Cluster** | Devnet |
| **Framework** | Anchor 0.31.1 |
| **IDL** | [View on Explorer](https://explorer.solana.com/address/HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd/idl?cluster=devnet) |

## How It Works

1. **Admin initializes** the vault with target allocation percentages across DeFi protocols and configures fees/caps.
2. **Users deposit SOL** into the vault PDA and receive proportional vault shares. First deposit uses a fixed ratio (1 SOL = 1,000,000,000 shares); subsequent deposits are proportional to existing share/deposit ratio.
3. **Admin rebalances** the vault periodically, adjusting allocations toward target percentages across protocols.
4. **Users withdraw** by burning shares. The vault returns proportional SOL minus a performance fee charged only on yield (not principal).
5. **Withdrawals always work** — even when the vault is paused, users can withdraw as an emergency escape hatch.

### Share Accounting

- Shares represent proportional ownership of the vault's total deposits
- Share price = `total_deposited / total_shares`
- On deposit: `shares_minted = deposit_amount * total_shares / total_deposited`
- On withdrawal: `sol_returned = shares_burned * total_deposited / total_shares`
- Performance fee is only charged on the yield portion (withdrawal value minus proportional deposit)
- Rounding policy: deposits round shares **down** (favor vault), withdrawals round amount **down** (favor vault)

### Protocol Allocations

The vault supports up to 10 protocol allocations, each with a target percentage and current amount:

| ID | Protocol | Description |
|----|----------|-------------|
| 0  | Jito     | Liquid staking + MEV rewards |
| 1  | Marinade | Liquid staking (mSOL) |
| 2  | Sanctum  | LST aggregator |
| 3  | marginfi | Lending/borrowing |
| 4  | Kamino   | Automated liquidity |

Target percentages must sum to 100%. Rebalancing adjusts `current_amount` for each allocation toward its target.

## Instructions

| Instruction | Access | Description |
|---|---|---|
| `initialize` | Authority | Create vault PDA with fee config, deposit cap, and allocation targets |
| `deposit` | Any user | Deposit SOL, receive proportional shares. Creates position PDA if first deposit |
| `withdraw` | Position owner | Burn shares, receive proportional SOL minus performance fee on yield |
| `rebalance` | Authority | Adjust current allocations toward target percentages |
| `updateAllocations` | Authority | Replace allocation targets (must sum to 100%, no duplicates, max 10) |
| `updateConfig` | Authority | Update fee (max 3000 bps), deposit cap, or pause state |
| `collectFees` | Authority | Withdraw accrued performance fees to authority |
| `closePosition` | Position owner | Close empty position and reclaim rent |
| `proposeAuthority` | Authority | Propose new authority (step 1 of two-step transfer) |
| `acceptAuthority` | New authority | Accept authority transfer (step 2) |

## Events

All instructions emit structured on-chain events for indexing and audit trails:

| Event | Emitted By |
|---|---|
| `DepositEvent` | `deposit` |
| `WithdrawEvent` | `withdraw` |
| `RebalanceEvent` | `rebalance` |
| `ConfigUpdatedEvent` | `updateConfig` |
| `FeeCollectedEvent` | `collectFees` |
| `AuthorityProposedEvent` | `proposeAuthority` |
| `AuthorityAcceptedEvent` | `acceptAuthority` |
| `PositionClosedEvent` | `closePosition` |

## Account Structure

**Vault PDA** — `seeds: [b"vault"]`

| Field | Type | Description |
|---|---|---|
| `authority` | Pubkey | Admin who can rebalance and update config |
| `total_deposited` | u64 | Total SOL in vault (lamports) |
| `total_shares` | u64 | Total shares issued |
| `performance_fee_bps` | u16 | Fee on yield in basis points (max 3000 = 30%) |
| `deposit_cap` | u64 | Max total deposits (0 = unlimited) |
| `is_paused` | bool | Emergency pause flag (deposits only; withdrawals always allowed) |
| `num_allocations` | u8 | Number of active allocations |
| `allocations` | Vec\<Allocation\> | Protocol allocations (max 10) |
| `bump` | u8 | PDA bump seed |
| `accrued_fees` | u64 | Accumulated performance fees |
| `last_rebalance_ts` | i64 | Unix timestamp of last rebalance |
| `depositor_count` | u64 | Number of active depositors |
| `pending_authority` | Pubkey | Pending authority for two-step transfer |

**UserPosition PDA** — `seeds: [b"position", user_pubkey]`

| Field | Type | Description |
|---|---|---|
| `owner` | Pubkey | Position owner |
| `shares` | u64 | Vault shares held |
| `deposited_amount` | u64 | Total SOL deposited (for fee calculation) |
| `last_deposit_ts` | i64 | Timestamp of last deposit |
| `bump` | u8 | PDA bump seed |

## Constants

| Constant | Value | Description |
|---|---|---|
| `MIN_DEPOSIT_LAMPORTS` | 10,000,000 (0.01 SOL) | Minimum deposit to prevent share price manipulation |
| `MAX_FEE_BPS` | 3000 (30%) | Maximum allowed performance fee |
| `SHARES_PER_SOL` | 1,000,000,000 | Initial share ratio for first deposit |
| `MAX_ALLOCATIONS` | 10 | Maximum number of protocol allocations |
| `BPS_DENOMINATOR` | 10,000 | Basis points denominator |

## Error Codes

| Error | Description |
|---|---|
| `Unauthorized` | Caller is not the vault authority |
| `VaultPaused` | Vault is paused (deposits blocked) |
| `DepositCapExceeded` | Deposit would exceed vault cap |
| `ZeroAmount` | Amount must be > 0 |
| `InsufficientShares` | Not enough shares to burn |
| `InvalidAllocations` | Percentages don't sum to 100, duplicates, or empty |
| `TooManyAllocations` | Exceeds MAX_ALLOCATIONS (10) |
| `FeeTooHigh` | Fee exceeds 3000 bps |
| `MathOverflow` | Arithmetic overflow in checked math |
| `BelowMinimumDeposit` | Deposit below 0.01 SOL |
| `NoSharesOutstanding` | Cannot withdraw from vault with 0 shares |
| `DustWithdrawal` | Partial withdrawal would leave below-minimum value |
| `BelowRentExemption` | Operation would leave vault below rent-exempt minimum |
| `NoPendingTransfer` | No pending authority transfer to accept |

## Security

- **Checked math everywhere** — All arithmetic uses `checked_*` operations, all `u128→u64` casts use `try_into()`
- **Share price manipulation prevention** — Minimum deposit of 0.01 SOL prevents rounding attacks
- **Authority checks** — All admin operations validated via `has_one = authority` constraint
- **Emergency withdrawals** — Withdrawals always allowed, even when vault is paused
- **Fee drain guard** — Fee collection cannot drain vault below rent-exemption + total depositor claims
- **Two-step authority transfer** — `proposeAuthority` → `acceptAuthority` prevents accidental lockout
- **Deposit caps** — Configurable maximum total deposits
- **Dust prevention** — Partial withdrawals must leave at least MIN_DEPOSIT_LAMPORTS in remaining position value
- **PDA-based accounts** — All state accounts are Program Derived Addresses, no private key custody
- **Rent-exemption enforcement** — Withdraw and fee collection ensure vault retains minimum balance

## Project Structure

```
programs/solvault/src/
├── lib.rs                          # Program entry, 10 instructions
├── state.rs                        # Vault, UserPosition, Allocation + 8 events
├── errors.rs                       # 14 custom error codes
└── instructions/
    ├── initialize.rs               # Vault setup
    ├── deposit.rs                  # SOL deposit → shares
    ├── withdraw.rs                 # Shares → SOL withdrawal
    ├── rebalance.rs                # Rebalance allocations
    ├── update_allocations.rs       # Change allocation targets
    ├── update_config.rs            # Update fee/cap/pause
    ├── collect_fees.rs             # Withdraw accrued fees
    ├── close_position.rs           # Close empty position
    └── transfer_authority.rs       # Two-step authority transfer

tests/
└── solvault.ts                     # 37 integration tests

frontend/
├── src/pages/
│   ├── Index.tsx                   # Landing page
│   └── AppDashboard.tsx            # Vault dashboard
└── src/components/
    ├── landing/                    # Hero, Features, Integrations, etc.
    └── icons/ProtocolIcons.tsx     # Shared SVG icons
```

## Build & Test

```sh
# Build the program
anchor build --no-idl -- --tools-version v1.52

# Run all 37 integration tests (starts local validator)
anchor test --skip-build

# Build IDL separately
RUSTC=~/.cache/solana/v1.52/platform-tools/rust/bin/rustc \
CARGO=~/.cache/solana/v1.52/platform-tools/rust/bin/cargo \
anchor idl build --out target/idl/solvault.json

# Frontend
cd frontend && npm install && npm run dev
```

## Tech Stack

| Component | Technology |
|---|---|
| Smart Contract | Rust + Anchor 0.31.1 |
| Blockchain | Solana (devnet) |
| Platform Tools | v1.52 |
| Tests | TypeScript, Mocha, Chai |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |

## License

MIT

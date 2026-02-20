# VaultSol — Solana Yield Optimization Vault

Automated SOL yield optimization protocol on Solana. Deposits SOL into a non-custodial vault and routes allocations across leading DeFi protocols (Jito, Marinade, Sanctum, marginfi, Kamino) for optimized yield.

## Architecture

```
solvault-optimizer/
├── programs/solvault/    # Anchor smart contract (Rust)
│   └── src/
│       ├── lib.rs                  # Program entry point
│       ├── state.rs                # Account structs (Vault, UserPosition, Allocation)
│       ├── errors.rs               # Custom error codes
│       └── instructions/           # Instruction handlers
│           ├── initialize.rs       # Create vault with allocation targets
│           ├── deposit.rs          # Deposit SOL, receive shares
│           ├── withdraw.rs         # Burn shares, receive SOL
│           ├── rebalance.rs        # Rebalance across protocols
│           ├── update_allocations.rs # Update target percentages
│           └── update_config.rs    # Update fee, cap, pause state
├── tests/                # Integration tests (TypeScript, 28 tests)
├── frontend/             # React landing page & dashboard
├── Anchor.toml           # Anchor workspace config
└── Cargo.toml            # Rust workspace
```

## How It Works

1. **Admin initializes** the vault with target allocation percentages across DeFi protocols and configures fees/caps.
2. **Users deposit SOL** into the vault PDA and receive proportional vault shares. First deposit uses a fixed ratio (1 SOL = 1,000,000 shares); subsequent deposits are proportional to existing share/deposit ratio.
3. **Admin rebalances** the vault periodically, adjusting allocations toward target percentages across protocols.
4. **Users withdraw** by burning shares. The vault returns proportional SOL minus a performance fee charged only on yield (not principal).

### Share Accounting

- Shares represent proportional ownership of the vault's total deposits.
- Share price = `total_deposited / total_shares`
- On deposit: `shares_minted = deposit_amount * total_shares / total_deposited`
- On withdrawal: `sol_returned = shares_burned * total_deposited / total_shares`
- Performance fee is only charged on the yield portion (withdrawal value minus proportional deposit).

### Protocol Allocations

The vault supports up to 10 protocol allocations, each with a target percentage and current amount. Supported protocols:

| ID | Protocol | Description |
|----|----------|-------------|
| 0  | Jito     | Liquid staking + MEV rewards |
| 1  | Marinade | Liquid staking (mSOL) |
| 2  | Sanctum  | LST aggregator |
| 3  | marginfi | Lending/borrowing |
| 4  | Kamino   | Automated liquidity |

Target percentages must sum to 100%. Rebalancing adjusts `current_amount` for each allocation toward its target. The last allocation receives the remainder to avoid rounding issues.

## Smart Contract

Built with **Anchor 0.31.1** on Solana using **platform-tools v1.52**.

### Instructions

| Instruction | Access | Description |
|---|---|---|
| `initialize` | Admin | Create vault PDA with authority, fee config (bps), deposit cap, and allocation targets |
| `deposit` | Any user | Deposit SOL into vault, receive proportional shares. Creates user position PDA if first deposit (`init_if_needed`) |
| `withdraw` | Position owner | Burn shares, receive proportional SOL minus performance fee on yield. Dust prevention on remaining balance |
| `rebalance` | Admin | Adjust current allocations toward target percentages. Updates `last_rebalance_ts` |
| `update_allocations` | Admin | Replace allocation targets (must sum to 100%, no duplicate protocol IDs, max 10) |
| `update_config` | Admin | Update fee (max 3000 bps), deposit cap, or pause state. All fields optional |

### Account Structure

**Vault PDA** — `seeds: [b"vault"]`

| Field | Type | Description |
|---|---|---|
| `authority` | Pubkey | Admin who can rebalance and update config |
| `total_deposited` | u64 | Total SOL in vault (lamports) |
| `total_shares` | u64 | Total shares issued |
| `performance_fee_bps` | u16 | Fee on yield in basis points (max 3000 = 30%) |
| `deposit_cap` | u64 | Max total deposits (0 = unlimited) |
| `is_paused` | bool | Emergency pause flag |
| `allocations` | Vec\<Allocation\> | Protocol allocations (max 10) |
| `accrued_fees` | u64 | Accumulated performance fees |
| `last_rebalance_ts` | i64 | Unix timestamp of last rebalance |
| `depositor_count` | u64 | Number of active depositors |

**UserPosition PDA** — `seeds: [b"position", user_pubkey]`

| Field | Type | Description |
|---|---|---|
| `owner` | Pubkey | Position owner |
| `shares` | u64 | Vault shares held |
| `deposited_amount` | u64 | Total SOL deposited (for fee calculation) |
| `last_deposit_ts` | i64 | Timestamp of last deposit |

### Constants

| Constant | Value | Description |
|---|---|---|
| `MIN_DEPOSIT_LAMPORTS` | 10,000,000 (0.01 SOL) | Minimum deposit to prevent share price manipulation |
| `MAX_FEE_BPS` | 3000 (30%) | Maximum allowed performance fee |
| `SHARES_PER_SOL` | 1,000,000 | Initial share ratio for first deposit |
| `MAX_ALLOCATIONS` | 10 | Maximum number of protocol allocations |

### Error Codes

| Error | Description |
|---|---|
| `Unauthorized` | Caller is not the vault authority |
| `VaultPaused` | Vault is paused — deposits/withdrawals blocked |
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

### Security Features

- **Checked math** — All arithmetic uses `checked_add`, `checked_sub`, `checked_mul`, `checked_div` with overflow protection
- **Share price manipulation prevention** — Minimum deposit of 0.01 SOL prevents rounding attacks
- **Authority checks** — All admin operations validated via `has_one = authority` constraint
- **Emergency pause** — Admin can halt deposits and withdrawals instantly
- **Deposit caps** — Configurable maximum total deposits
- **Dust prevention** — Partial withdrawals must leave at least MIN_DEPOSIT_LAMPORTS in remaining position value
- **Performance fee on yield only** — Fee calculated only on profit above deposited principal, using basis points precision (1 bps = 0.01%)
- **PDA-based accounts** — All state accounts are Program Derived Addresses, no private key custody
- **Proportional fee tracking** — Per-user `deposited_amount` tracks cost basis for accurate yield calculation

## Tests

28 integration tests covering all instructions and edge cases:

```
  solvault
    initialize
      ✔ initializes the vault with correct parameters
    deposit
      ✔ deposits SOL and mints shares (first deposit)
      ✔ deposits additional SOL with proportional shares
      ✔ second user can deposit and gets own position
      ✔ rejects deposit below minimum (0.01 SOL)
      ✔ rejects deposit exceeding vault cap
    withdraw
      ✔ withdraws SOL by burning shares
      ✔ rejects withdrawal with insufficient shares
      ✔ rejects zero amount withdrawal
      ✔ rejects withdrawal when vault is paused
    rebalance
      ✔ rebalances allocations based on target percentages
      ✔ rejects rebalance from non-authority
      ✔ updates last_rebalance_ts timestamp
    update_allocations
      ✔ updates allocation targets
      ✔ rejects allocations not summing to 100
      ✔ rejects duplicate protocol IDs
      ✔ rejects empty allocations
      ✔ rejects update_allocations from non-authority
    update_config
      ✔ updates performance fee
      ✔ updates deposit cap
      ✔ pauses the vault
      ✔ rejects deposits when paused
      ✔ unpauses the vault
      ✔ rejects fee above maximum (30%)
      ✔ accepts fee at exactly maximum (30%)
      ✔ rejects update_config from non-authority
      ✔ can update multiple config fields at once
    end-to-end flow
      ✔ full lifecycle: deposit, rebalance, withdraw all
```

## Build & Test

```sh
# Prerequisites
# - Rust + Solana CLI 3.x + Anchor CLI 0.31.x
# - Node.js + npm

# Build the program
anchor build --no-idl -- --tools-version v1.52

# Run tests (starts local validator automatically)
anchor test --skip-build

# Frontend
cd frontend && npm install && npm run dev
```

## Deployment

Deployed to Solana **devnet**.

```
Program ID: HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd
```

Verify on Solana Explorer: [View on devnet](https://explorer.solana.com/address/HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd?cluster=devnet)

## Tech Stack

| Component | Technology |
|---|---|
| Smart Contract | Rust + Anchor 0.31.1 |
| Blockchain | Solana (devnet) |
| Platform Tools | v1.52 |
| Tests | TypeScript, Mocha, Chai |
| Frontend | React, Vite, Tailwind CSS |

## License

MIT

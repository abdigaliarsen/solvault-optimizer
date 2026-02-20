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
├── tests/                # Integration tests (TypeScript)
├── frontend/             # React landing page & dashboard
├── Anchor.toml           # Anchor workspace config
└── Cargo.toml            # Rust workspace
```

## Smart Contract

Built with Anchor 0.31.1 on Solana.

### Instructions

| Instruction | Description |
|---|---|
| `initialize` | Create vault with admin, fee config, allocation targets |
| `deposit` | Deposit SOL, receive proportional vault shares |
| `withdraw` | Burn shares, receive SOL minus performance fee on yield |
| `rebalance` | Admin rebalances allocations toward target percentages |
| `update_allocations` | Admin updates target allocation percentages |
| `update_config` | Admin updates fee, deposit cap, or pause state |

### Security Features

- Checked math (overflow protection) on all arithmetic
- Share price manipulation prevention (minimum deposit)
- Authority checks on all admin operations
- Emergency pause mechanism
- Deposit caps
- Dust withdrawal prevention
- Performance fee with basis points precision

## Build & Test

```sh
# Build the program
anchor build --no-idl -- --tools-version v1.52

# Run tests (starts local validator automatically)
anchor test --skip-build

# Frontend
cd frontend && npm install && npm run dev
```

## Program ID

```
HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd
```

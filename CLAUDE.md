# VaultSol — Solana Yield Optimization Vault

## Build & Test Commands

```sh
# Build (requires platform-tools v1.52 for edition2024 support)
anchor build --no-idl -- --tools-version v1.52

# Build IDL separately (uses platform-tools cargo/rustc)
RUSTC=~/.cache/solana/v1.52/platform-tools/rust/bin/rustc CARGO=~/.cache/solana/v1.52/platform-tools/rust/bin/cargo anchor idl build --out target/idl/solvault.json

# Run all 37 integration tests (starts local validator)
anchor test --skip-build

# Quick compilation check (no validator needed)
cargo check --manifest-path programs/solvault/Cargo.toml
```

## Program ID

```
HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd
```

Deployed to Solana devnet.

## Project Structure

- `programs/solvault/src/` — Anchor smart contract (Rust)
  - `lib.rs` — Program entry, 10 instructions
  - `state.rs` — Vault, UserPosition, Allocation accounts
  - `errors.rs` — 14 custom error codes
  - `instructions/` — Handler for each instruction
- `tests/solvault.ts` — 37 TypeScript integration tests
- `frontend/` — React/Vite/Tailwind landing page & dashboard

## Rules

1. ALWAYS run `anchor test --skip-build` before considering work complete
2. NEVER commit if tests fail
3. NEVER suppress compiler warnings with `#[allow(...)]`
4. NEVER edit `Cargo.lock` or `package-lock.json` directly
5. All accounts MUST be validated in Anchor constraints (`has_one`, `seeds`, `bump`)
6. All arithmetic MUST use checked math (`checked_add`, `checked_sub`, `checked_mul`, `checked_div`)
7. Use `anchor build --no-idl -- --tools-version v1.52` — the `--tools-version v1.52` flag is required

## Key Constants (state.rs)

- `MIN_DEPOSIT_LAMPORTS` = 10,000,000 (0.01 SOL)
- `MAX_FEE_BPS` = 3000 (30%)
- `SHARES_PER_SOL` = 1,000,000,000
- `MAX_ALLOCATIONS` = 10

## PDA Seeds

- Vault: `[b"vault"]`
- UserPosition: `[b"position", user_pubkey]`

Seeds must be consistent between Rust (`programs/solvault/src/state.rs`) and TypeScript (`tests/solvault.ts`).

## Common Pitfalls

- Treasury is the vault PDA itself (no separate treasury account). SOL is held directly in the vault PDA.
- Withdraw modifies vault PDA lamports directly via `try_borrow_mut_lamports()` since the program owns the vault PDA.
- Withdraw and collect_fees enforce rent-exemption: vault must retain `Rent::minimum_balance()` after any transfer.
- `init_if_needed` feature is enabled in `programs/solvault/Cargo.toml` for lazy UserPosition creation.
- Authority transfer is two-step: `propose_authority` (current authority sets pending) → `accept_authority` (new authority signs to confirm).
- All `u128 → u64` casts use `try_into()` to prevent silent truncation.
- The `--tools-version v1.52` flag is needed because `constant_time_eq` crate requires edition2024 (rustc 1.85+).

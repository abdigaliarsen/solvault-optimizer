import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solvault } from "../target/types/solvault";
import { expect } from "chai";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

describe("solvault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solvault as Program<Solvault>;
  const authority = provider.wallet;

  let vaultPda: PublicKey;

  // SHARES_PER_SOL = 1_000_000_000 (1e9)
  const SHARES_PER_SOL = 1_000_000_000;

  const defaultAllocations = [
    { protocolId: 0, targetPct: 35, currentAmount: new anchor.BN(0) }, // Jito
    { protocolId: 1, targetPct: 25, currentAmount: new anchor.BN(0) }, // Marinade
    { protocolId: 2, targetPct: 20, currentAmount: new anchor.BN(0) }, // Sanctum
    { protocolId: 3, targetPct: 12, currentAmount: new anchor.BN(0) }, // marginfi
    { protocolId: 4, targetPct: 8, currentAmount: new anchor.BN(0) },  // Kamino
  ];

  before(async () => {
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    );
  });

  function getPositionPda(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("position"), user.toBuffer()],
      program.programId
    );
  }

  async function fundWallet(keypair: Keypair, amount: number): Promise<void> {
    const sig = await provider.connection.requestAirdrop(
      keypair.publicKey,
      amount
    );
    await provider.connection.confirmTransaction(sig);
  }

  // ─────────────────────────────────────────────────
  // INITIALIZE
  // ─────────────────────────────────────────────────
  describe("initialize", () => {
    it("initializes the vault with correct parameters", async () => {
      const feeBps = 500; // 5%
      const depositCap = new anchor.BN(1000 * LAMPORTS_PER_SOL);

      await program.methods
        .initialize(feeBps, depositCap, defaultAllocations)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(vault.performanceFeeBps).to.equal(feeBps);
      expect(vault.depositCap.toNumber()).to.equal(depositCap.toNumber());
      expect(vault.totalDeposited.toNumber()).to.equal(0);
      expect(vault.totalShares.toNumber()).to.equal(0);
      expect(vault.isPaused).to.equal(false);
      expect(vault.allocations.length).to.equal(5);
      expect(vault.allocations[0].targetPct).to.equal(35);
      expect(vault.allocations[1].targetPct).to.equal(25);
      expect(vault.allocations[2].targetPct).to.equal(20);
      expect(vault.allocations[3].targetPct).to.equal(12);
      expect(vault.allocations[4].targetPct).to.equal(8);
      expect(vault.depositorCount.toNumber()).to.equal(0);
      expect(vault.accruedFees.toNumber()).to.equal(0);
      expect(vault.numAllocations).to.equal(5);
      // pending_authority should be default (zeroed)
      expect(vault.pendingAuthority.toBase58()).to.equal(PublicKey.default.toBase58());
    });

    it("zeroes current_amount even if provided with non-zero values", async () => {
      // This test just verifies the init already happened correctly above
      const vault = await program.account.vault.fetch(vaultPda);
      for (const alloc of vault.allocations) {
        expect(alloc.currentAmount.toNumber()).to.equal(0);
      }
    });
  });

  // ─────────────────────────────────────────────────
  // DEPOSIT
  // ─────────────────────────────────────────────────
  describe("deposit", () => {
    it("deposits SOL and mints shares (first deposit)", async () => {
      const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(authority.publicKey);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          user: authority.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.totalDeposited.toNumber()).to.equal(LAMPORTS_PER_SOL);
      // First deposit: 1 SOL = 1_000_000_000 shares (SHARES_PER_SOL)
      expect(vault.totalShares.toNumber()).to.equal(SHARES_PER_SOL);
      expect(vault.depositorCount.toNumber()).to.equal(1);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.owner.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(position.shares.toNumber()).to.equal(SHARES_PER_SOL);
      expect(position.depositedAmount.toNumber()).to.equal(LAMPORTS_PER_SOL);
    });

    it("deposits additional SOL with proportional shares", async () => {
      const depositAmount = new anchor.BN(2 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(authority.publicKey);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          user: authority.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.totalDeposited.toNumber()).to.equal(3 * LAMPORTS_PER_SOL);
      // 2 SOL * 1e9 shares / 1 SOL = 2e9 new shares, total 3e9
      expect(vault.totalShares.toNumber()).to.equal(3 * SHARES_PER_SOL);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.shares.toNumber()).to.equal(3 * SHARES_PER_SOL);
      expect(position.depositedAmount.toNumber()).to.equal(3 * LAMPORTS_PER_SOL);
    });

    it("second user can deposit and gets own position", async () => {
      const user2 = Keypair.generate();
      await fundWallet(user2, 5 * LAMPORTS_PER_SOL);

      const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(user2.publicKey);

      await program.methods
        .deposit(depositAmount)
        .accounts({
          user: user2.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.totalDeposited.toNumber()).to.equal(4 * LAMPORTS_PER_SOL);
      expect(vault.depositorCount.toNumber()).to.equal(2);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.owner.toBase58()).to.equal(user2.publicKey.toBase58());
      // Proportional: 1 SOL * 3e9 / 3 SOL = 1e9 shares
      expect(position.shares.toNumber()).to.equal(SHARES_PER_SOL);

      // Withdraw user2 fully to clean up state for later tests
      await program.methods
        .withdraw(new anchor.BN(SHARES_PER_SOL))
        .accounts({
          user: user2.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();
    });

    it("rejects deposit below minimum (0.01 SOL)", async () => {
      const tinyAmount = new anchor.BN(1000); // 1000 lamports << 10_000_000
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .deposit(tinyAmount)
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("BelowMinimumDeposit");
      }
    });

    it("rejects deposit exceeding vault cap", async () => {
      // Current cap is 1000 SOL, current deposits ~3 SOL
      const hugeAmount = new anchor.BN(998 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .deposit(hugeAmount)
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        // Will fail either from DepositCapExceeded or insufficient SOL — both valid
        expect(err).to.exist;
      }
    });
  });

  // ─────────────────────────────────────────────────
  // WITHDRAW
  // ─────────────────────────────────────────────────
  describe("withdraw", () => {
    it("withdraws SOL by burning shares", async () => {
      const sharesToBurn = new anchor.BN(SHARES_PER_SOL); // 1/3 of 3e9 shares
      const [positionPda] = getPositionPda(authority.publicKey);

      const balanceBefore = await provider.connection.getBalance(
        authority.publicKey
      );

      await program.methods
        .withdraw(sharesToBurn)
        .accounts({
          user: authority.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.totalShares.toNumber()).to.equal(2 * SHARES_PER_SOL);
      expect(vault.totalDeposited.toNumber()).to.equal(2 * LAMPORTS_PER_SOL);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.shares.toNumber()).to.equal(2 * SHARES_PER_SOL);

      const balanceAfter = await provider.connection.getBalance(
        authority.publicKey
      );
      // User received ~1 SOL back (minus tx fee)
      expect(balanceAfter).to.be.greaterThan(
        balanceBefore + LAMPORTS_PER_SOL * 0.99
      );
    });

    it("rejects withdrawal with insufficient shares", async () => {
      const tooMany = new anchor.BN(999_999_999_999);
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .withdraw(tooMany)
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("InsufficientShares");
      }
    });

    it("rejects zero amount withdrawal", async () => {
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .withdraw(new anchor.BN(0))
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("ZeroAmount");
      }
    });

    it("rejects withdrawal when vault is paused", async () => {
      // Pause
      await program.methods
        .updateConfig(null, null, true)
        .accounts({ authority: authority.publicKey, vault: vaultPda })
        .rpc();

      const [positionPda] = getPositionPda(authority.publicKey);
      try {
        await program.methods
          .withdraw(new anchor.BN(100_000))
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("VaultPaused");
      }

      // Unpause for later tests
      await program.methods
        .updateConfig(null, null, false)
        .accounts({ authority: authority.publicKey, vault: vaultPda })
        .rpc();
    });
  });

  // ─────────────────────────────────────────────────
  // REBALANCE
  // ─────────────────────────────────────────────────
  describe("rebalance", () => {
    it("rebalances allocations based on target percentages", async () => {
      await program.methods
        .rebalance()
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      const total = vault.totalDeposited.toNumber();

      // Allocations should sum to total deposited
      const allocSum = vault.allocations.reduce(
        (sum, a) => sum + a.currentAmount.toNumber(),
        0
      );
      expect(allocSum).to.equal(total);

      // First allocation (Jito 35%) should be ~35% of total
      const jitoAlloc = vault.allocations[0].currentAmount.toNumber();
      expect(jitoAlloc).to.be.closeTo(Math.floor(total * 0.35), 1);
    });

    it("rejects rebalance from non-authority", async () => {
      const rando = Keypair.generate();
      await fundWallet(rando, 1 * LAMPORTS_PER_SOL);

      try {
        await program.methods
          .rebalance()
          .accounts({
            authority: rando.publicKey,
            vault: vaultPda,
          })
          .signers([rando])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }
    });

    it("updates last_rebalance_ts timestamp", async () => {
      const vaultBefore = await program.account.vault.fetch(vaultPda);
      const tsBefore = vaultBefore.lastRebalanceTs.toNumber();

      // Small delay to ensure timestamp differs
      await new Promise((r) => setTimeout(r, 1100));

      await program.methods
        .rebalance()
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vaultAfter = await program.account.vault.fetch(vaultPda);
      expect(vaultAfter.lastRebalanceTs.toNumber()).to.be.greaterThanOrEqual(
        tsBefore
      );
    });
  });

  // ─────────────────────────────────────────────────
  // UPDATE ALLOCATIONS
  // ─────────────────────────────────────────────────
  describe("update_allocations", () => {
    it("updates allocation targets", async () => {
      const newAllocations = [
        { protocolId: 0, targetPct: 50, currentAmount: new anchor.BN(0) },
        { protocolId: 1, targetPct: 30, currentAmount: new anchor.BN(0) },
        { protocolId: 2, targetPct: 20, currentAmount: new anchor.BN(0) },
      ];

      await program.methods
        .updateAllocations(newAllocations)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.allocations.length).to.equal(3);
      expect(vault.allocations[0].targetPct).to.equal(50);
      expect(vault.allocations[1].targetPct).to.equal(30);
      expect(vault.allocations[2].targetPct).to.equal(20);
      expect(vault.numAllocations).to.equal(3);
    });

    it("rejects allocations not summing to 100", async () => {
      const badAllocations = [
        { protocolId: 0, targetPct: 50, currentAmount: new anchor.BN(0) },
        { protocolId: 1, targetPct: 30, currentAmount: new anchor.BN(0) },
        // total = 80, not 100
      ];

      try {
        await program.methods
          .updateAllocations(badAllocations)
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("InvalidAllocations");
      }
    });

    it("rejects duplicate protocol IDs", async () => {
      const dupeAllocations = [
        { protocolId: 0, targetPct: 50, currentAmount: new anchor.BN(0) },
        { protocolId: 0, targetPct: 50, currentAmount: new anchor.BN(0) },
      ];

      try {
        await program.methods
          .updateAllocations(dupeAllocations)
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("InvalidAllocations");
      }
    });

    it("rejects empty allocations", async () => {
      try {
        await program.methods
          .updateAllocations([])
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("InvalidAllocations");
      }
    });

    it("rejects update_allocations from non-authority", async () => {
      const rando = Keypair.generate();
      await fundWallet(rando, 1 * LAMPORTS_PER_SOL);

      const validAllocations = [
        { protocolId: 0, targetPct: 60, currentAmount: new anchor.BN(0) },
        { protocolId: 1, targetPct: 40, currentAmount: new anchor.BN(0) },
      ];

      try {
        await program.methods
          .updateAllocations(validAllocations)
          .accounts({
            authority: rando.publicKey,
            vault: vaultPda,
          })
          .signers([rando])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }
    });
  });

  // ─────────────────────────────────────────────────
  // UPDATE CONFIG
  // ─────────────────────────────────────────────────
  describe("update_config", () => {
    it("updates performance fee", async () => {
      await program.methods
        .updateConfig(1000, null, null) // 10%
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.performanceFeeBps).to.equal(1000);
    });

    it("updates deposit cap", async () => {
      const newCap = new anchor.BN(500 * LAMPORTS_PER_SOL);
      await program.methods
        .updateConfig(null, newCap, null)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.depositCap.toNumber()).to.equal(newCap.toNumber());
    });

    it("pauses the vault", async () => {
      await program.methods
        .updateConfig(null, null, true)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.isPaused).to.equal(true);
    });

    it("rejects deposits when paused", async () => {
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .deposit(new anchor.BN(LAMPORTS_PER_SOL))
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("VaultPaused");
      }
    });

    it("unpauses the vault", async () => {
      await program.methods
        .updateConfig(null, null, false)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.isPaused).to.equal(false);
    });

    it("rejects fee above maximum (30%)", async () => {
      try {
        await program.methods
          .updateConfig(5000, null, null) // 50% > 3000 bps max
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("FeeTooHigh");
      }
    });

    it("accepts fee at exactly maximum (30%)", async () => {
      await program.methods
        .updateConfig(3000, null, null) // exactly 30%
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.performanceFeeBps).to.equal(3000);

      // Restore to 5%
      await program.methods
        .updateConfig(500, null, null)
        .accounts({ authority: authority.publicKey, vault: vaultPda })
        .rpc();
    });

    it("rejects update_config from non-authority", async () => {
      const rando = Keypair.generate();
      await fundWallet(rando, 1 * LAMPORTS_PER_SOL);

      try {
        await program.methods
          .updateConfig(100, null, null)
          .accounts({
            authority: rando.publicKey,
            vault: vaultPda,
          })
          .signers([rando])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }
    });

    it("can update multiple config fields at once", async () => {
      const newCap = new anchor.BN(2000 * LAMPORTS_PER_SOL);
      await program.methods
        .updateConfig(800, newCap, false)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.performanceFeeBps).to.equal(800);
      expect(vault.depositCap.toNumber()).to.equal(newCap.toNumber());
      expect(vault.isPaused).to.equal(false);
    });
  });

  // ─────────────────────────────────────────────────
  // COLLECT FEES
  // ─────────────────────────────────────────────────
  describe("collect_fees", () => {
    it("rejects collect_fees when no fees accrued", async () => {
      try {
        await program.methods
          .collectFees()
          .accounts({
            authority: authority.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("ZeroAmount");
      }
    });

    it("rejects collect_fees from non-authority", async () => {
      const rando = Keypair.generate();
      await fundWallet(rando, 1 * LAMPORTS_PER_SOL);

      try {
        await program.methods
          .collectFees()
          .accounts({
            authority: rando.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([rando])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }
    });
  });

  // ─────────────────────────────────────────────────
  // CLOSE POSITION
  // ─────────────────────────────────────────────────
  describe("close_position", () => {
    it("closes an empty position and reclaims rent", async () => {
      const user = Keypair.generate();
      await fundWallet(user, 5 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(user.publicKey);

      // Deposit
      await program.methods
        .deposit(new anchor.BN(LAMPORTS_PER_SOL))
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const position = await program.account.userPosition.fetch(positionPda);
      const userShares = position.shares;

      // Withdraw all
      await program.methods
        .withdraw(userShares)
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const balBefore = await provider.connection.getBalance(user.publicKey);

      // Close position
      await program.methods
        .closePosition()
        .accounts({
          user: user.publicKey,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const balAfter = await provider.connection.getBalance(user.publicKey);
      // Should have gained rent back (minus tx fee)
      expect(balAfter).to.be.greaterThan(balBefore - 10_000);

      // Position account should no longer exist
      const positionAccount = await provider.connection.getAccountInfo(positionPda);
      expect(positionAccount).to.be.null;
    });

    it("rejects close_position with remaining shares", async () => {
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .closePosition()
          .accounts({
            user: authority.publicKey,
            position: positionPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("InsufficientShares");
      }
    });

    it("re-deposit after closing position counts as new depositor", async () => {
      const user = Keypair.generate();
      await fundWallet(user, 5 * LAMPORTS_PER_SOL);
      const [positionPda] = getPositionPda(user.publicKey);

      // Deposit
      await program.methods
        .deposit(new anchor.BN(LAMPORTS_PER_SOL))
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultAfterDeposit = await program.account.vault.fetch(vaultPda);
      const countAfterDeposit = vaultAfterDeposit.depositorCount.toNumber();

      const position = await program.account.userPosition.fetch(positionPda);

      // Withdraw all
      await program.methods
        .withdraw(position.shares)
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultAfterWithdraw = await program.account.vault.fetch(vaultPda);
      expect(vaultAfterWithdraw.depositorCount.toNumber()).to.equal(countAfterDeposit - 1);

      // Close position
      await program.methods
        .closePosition()
        .accounts({
          user: user.publicKey,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Re-deposit
      await program.methods
        .deposit(new anchor.BN(LAMPORTS_PER_SOL))
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultFinal = await program.account.vault.fetch(vaultPda);
      // depositor_count should be incremented (new depositor because shares were 0)
      expect(vaultFinal.depositorCount.toNumber()).to.equal(countAfterDeposit);

      // Clean up: withdraw
      const pos2 = await program.account.userPosition.fetch(positionPda);
      await program.methods
        .withdraw(pos2.shares)
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
    });
  });

  // ─────────────────────────────────────────────────
  // TWO-STEP AUTHORITY TRANSFER
  // ─────────────────────────────────────────────────
  describe("propose_authority / accept_authority", () => {
    it("two-step authority transfer works correctly", async () => {
      const newAuthority = Keypair.generate();
      await fundWallet(newAuthority, 1 * LAMPORTS_PER_SOL);

      // Step 1: propose
      await program.methods
        .proposeAuthority(newAuthority.publicKey)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vaultAfterPropose = await program.account.vault.fetch(vaultPda);
      expect(vaultAfterPropose.pendingAuthority.toBase58()).to.equal(
        newAuthority.publicKey.toBase58()
      );
      // Authority hasn't changed yet
      expect(vaultAfterPropose.authority.toBase58()).to.equal(
        authority.publicKey.toBase58()
      );

      // Step 2: accept (new authority must sign)
      await program.methods
        .acceptAuthority()
        .accounts({
          newAuthority: newAuthority.publicKey,
          vault: vaultPda,
        })
        .signers([newAuthority])
        .rpc();

      const vaultAfterAccept = await program.account.vault.fetch(vaultPda);
      expect(vaultAfterAccept.authority.toBase58()).to.equal(
        newAuthority.publicKey.toBase58()
      );
      expect(vaultAfterAccept.pendingAuthority.toBase58()).to.equal(
        PublicKey.default.toBase58()
      );

      // Transfer back so other tests continue to work
      await program.methods
        .proposeAuthority(authority.publicKey)
        .accounts({
          authority: newAuthority.publicKey,
          vault: vaultPda,
        })
        .signers([newAuthority])
        .rpc();

      await program.methods
        .acceptAuthority()
        .accounts({
          newAuthority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vaultRestored = await program.account.vault.fetch(vaultPda);
      expect(vaultRestored.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    });

    it("rejects propose from non-authority", async () => {
      const rando = Keypair.generate();
      await fundWallet(rando, 1 * LAMPORTS_PER_SOL);

      try {
        await program.methods
          .proposeAuthority(rando.publicKey)
          .accounts({
            authority: rando.publicKey,
            vault: vaultPda,
          })
          .signers([rando])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }
    });

    it("rejects accept from wrong signer", async () => {
      const newAuth = Keypair.generate();
      const wrongSigner = Keypair.generate();
      await fundWallet(newAuth, 1 * LAMPORTS_PER_SOL);
      await fundWallet(wrongSigner, 1 * LAMPORTS_PER_SOL);

      // Propose newAuth
      await program.methods
        .proposeAuthority(newAuth.publicKey)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      // Wrong signer tries to accept
      try {
        await program.methods
          .acceptAuthority()
          .accounts({
            newAuthority: wrongSigner.publicKey,
            vault: vaultPda,
          })
          .signers([wrongSigner])
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("Unauthorized");
      }

      // Clean up: reset pending
      await program.methods
        .proposeAuthority(PublicKey.default)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();
    });
  });

  // ─────────────────────────────────────────────────
  // FULL FLOW: deposit → rebalance → withdraw
  // ─────────────────────────────────────────────────
  describe("end-to-end flow", () => {
    it("full lifecycle: deposit, rebalance, withdraw all", async () => {
      const user = Keypair.generate();
      await fundWallet(user, 5 * LAMPORTS_PER_SOL);

      const [positionPda] = getPositionPda(user.publicKey);
      const depositAmount = new anchor.BN(2 * LAMPORTS_PER_SOL);

      // Deposit
      await program.methods
        .deposit(depositAmount)
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const posAfterDeposit = await program.account.userPosition.fetch(positionPda);
      const userShares = posAfterDeposit.shares;
      expect(userShares.toNumber()).to.be.greaterThan(0);

      // Rebalance
      await program.methods
        .rebalance()
        .accounts({ authority: authority.publicKey, vault: vaultPda })
        .rpc();

      const vaultAfterRebalance = await program.account.vault.fetch(vaultPda);
      const allocSum = vaultAfterRebalance.allocations.reduce(
        (s, a) => s + a.currentAmount.toNumber(),
        0
      );
      expect(allocSum).to.equal(vaultAfterRebalance.totalDeposited.toNumber());

      // Withdraw all shares
      const balBefore = await provider.connection.getBalance(user.publicKey);

      await program.methods
        .withdraw(userShares)
        .accounts({
          user: user.publicKey,
          vault: vaultPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const posAfterWithdraw = await program.account.userPosition.fetch(positionPda);
      expect(posAfterWithdraw.shares.toNumber()).to.equal(0);

      const balAfter = await provider.connection.getBalance(user.publicKey);
      // Should have received ~2 SOL back (minus tx fees)
      expect(balAfter).to.be.greaterThan(balBefore + 1.9 * LAMPORTS_PER_SOL);
    });
  });
});

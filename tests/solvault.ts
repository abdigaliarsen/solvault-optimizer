import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solvault } from "../target/types/solvault";
import { expect } from "chai";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("solvault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solvault as Program<Solvault>;
  const authority = provider.wallet;

  let vaultPda: PublicKey;

  const defaultAllocations = [
    { protocolId: 0, targetPct: 35, currentAmount: new anchor.BN(0) },
    { protocolId: 1, targetPct: 25, currentAmount: new anchor.BN(0) },
    { protocolId: 2, targetPct: 20, currentAmount: new anchor.BN(0) },
    { protocolId: 3, targetPct: 12, currentAmount: new anchor.BN(0) },
    { protocolId: 4, targetPct: 8, currentAmount: new anchor.BN(0) },
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

  describe("initialize", () => {
    it("initializes the vault with correct parameters", async () => {
      const feeBps = 500;
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
      expect(vault.depositorCount.toNumber()).to.equal(0);
    });
  });

  describe("deposit", () => {
    it("deposits SOL and mints shares", async () => {
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
      expect(vault.totalShares.toNumber()).to.equal(1_000_000);
      expect(vault.depositorCount.toNumber()).to.equal(1);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.owner.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(position.shares.toNumber()).to.equal(1_000_000);
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
      expect(vault.totalShares.toNumber()).to.equal(3_000_000);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.shares.toNumber()).to.equal(3_000_000);
      expect(position.depositedAmount.toNumber()).to.equal(3 * LAMPORTS_PER_SOL);
    });

    it("rejects deposit below minimum", async () => {
      const tinyAmount = new anchor.BN(1000);
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
  });

  describe("withdraw", () => {
    it("withdraws SOL by burning shares", async () => {
      const sharesToBurn = new anchor.BN(1_000_000);
      const [positionPda] = getPositionPda(authority.publicKey);

      const balanceBefore = await provider.connection.getBalance(authority.publicKey);

      await program.methods
        .withdraw(sharesToBurn)
        .accounts({
          user: authority.publicKey,
          vault: vaultPda,
          position: positionPda,
          owner: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.totalShares.toNumber()).to.equal(2_000_000);
      expect(vault.totalDeposited.toNumber()).to.equal(2 * LAMPORTS_PER_SOL);

      const position = await program.account.userPosition.fetch(positionPda);
      expect(position.shares.toNumber()).to.equal(2_000_000);

      const balanceAfter = await provider.connection.getBalance(authority.publicKey);
      // User should have received ~1 SOL back (minus tx fees)
      expect(balanceAfter).to.be.greaterThan(balanceBefore + LAMPORTS_PER_SOL * 0.99);
    });

    it("rejects withdrawal with insufficient shares", async () => {
      const tooMany = new anchor.BN(999_999_999);
      const [positionPda] = getPositionPda(authority.publicKey);

      try {
        await program.methods
          .withdraw(tooMany)
          .accounts({
            user: authority.publicKey,
            vault: vaultPda,
            position: positionPda,
            owner: authority.publicKey,
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
            owner: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err.toString()).to.contain("ZeroAmount");
      }
    });
  });

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

      const allocSum = vault.allocations.reduce(
        (sum, a) => sum + a.currentAmount.toNumber(),
        0
      );
      expect(allocSum).to.equal(total);

      const jitoAlloc = vault.allocations[0].currentAmount.toNumber();
      expect(jitoAlloc).to.be.closeTo(Math.floor(total * 0.35), 1);
    });
  });

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
      expect(vault.numAllocations).to.equal(3);
    });

    it("rejects allocations not summing to 100", async () => {
      const badAllocations = [
        { protocolId: 0, targetPct: 50, currentAmount: new anchor.BN(0) },
        { protocolId: 1, targetPct: 30, currentAmount: new anchor.BN(0) },
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
  });

  describe("update_config", () => {
    it("updates performance fee", async () => {
      await program.methods
        .updateConfig(1000, null, null)
        .accounts({
          authority: authority.publicKey,
          vault: vaultPda,
        })
        .rpc();

      const vault = await program.account.vault.fetch(vaultPda);
      expect(vault.performanceFeeBps).to.equal(1000);
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

    it("rejects fee above maximum", async () => {
      try {
        await program.methods
          .updateConfig(5000, null, null)
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
  });
});

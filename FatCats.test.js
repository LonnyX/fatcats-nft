const Project = artifacts.require("./Project.sol");
const { expect } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const BN = require("bn.js");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

contract("Project", (accounts) => {
  //ACCOUNTS
  const _owner = accounts[0];
  const _whitelistedAddress = accounts[1];
  const _Cus2 = accounts[2];
  const _Cus3 = accounts[3];
  const _Cus4 = accounts[4];
  const _whitelistedAddress2 = accounts[5];
  const _whitelistedAddressMproof3 = accounts[6];

  //MERKLE ROOT
  const MerkleRootProof1 =
    "0x58b91e2f2964fc3148b576cf9386b4ef772afa2f127063f9129e73f836e21187";
  const MerkleRootProof3 =
    "0x79887e04f19134d22ca36b78fd734da95ed2b8edc73c943574eb6e938811468f";

  //MERKLE PROOF
  const MProof1 = [
    "0x7a9148616d7c42e2748a13a069820e9fdb1eb3b2ffa8262a067975536dd0805f",
    "0x5197f61a6345ab44e3550f23afacd52ab8a87b18b83cd4ea8625c4177871e9b4",
    "0x539f391a95ecbf6b4b335d6325f53ca143419ff32a46decce606ee5cb62db614",
    "0xdda4814653a17a2ec15449a1485498373697ad737059e7583dfe92fc87bfa426",
  ];
  const Mproof2 = [
    "0xd21d22020758579fab625f433b06c3625bd9b4f8e7dcc6685c19cb8e98c2653c",
    "0x260c230107edf1a4f743fa747937a3aa3ace29faf2c02fd092f80fb1b46107b5",
    "0x6dd9e0e817cea48337acf15e1defeae251de461a6b1e07434dd0d8dc795aece4",
    "0xab021c55f47ea1a65085bd3bbd31c75e6b05903b1064c2c736a7281f3737ecf8",
  ];
  const Mproof3 = [
    "0x7a9148616d7c42e2748a13a069820e9fdb1eb3b2ffa8262a067975536dd0805f",
    "0x5197f61a6345ab44e3550f23afacd52ab8a87b18b83cd4ea8625c4177871e9b4",
    "0x539f391a95ecbf6b4b335d6325f53ca143419ff32a46decce606ee5cb62db614",
    "0xdda4814653a17a2ec15449a1485498373697ad737059e7583dfe92fc87bfa426",
  ];
  const Mproof13 = [
    "0x93230d0b2377404a36412e26d231de4c7e1a9fb62e227b420200ee950a5ca9c0",
    "0x5197f61a6345ab44e3550f23afacd52ab8a87b18b83cd4ea8625c4177871e9b4",
    "0x539f391a95ecbf6b4b335d6325f53ca143419ff32a46decce606ee5cb62db614",
    "0xdda4814653a17a2ec15449a1485498373697ad737059e7583dfe92fc87bfa426",
  ];
  beforeEach(async () => {
    SHK = await Project.new(
      "ipfs://QmXJnKLDqtcx41BP6iA3jxskpGE3LWQGUpHhfQVMb3Nu9X/true.json",
      "ipfs://QmXJnKLDqtcx41BP6iA3jxskpGE3LWQGUpHhfQVMb3Nu9X/hidden.json",
      MerkleRootProof1,
      _Cus4,
      "2512",
      "0x04B6669196fE2e77B6a7C4527f11b923eFE7641a"
    );
  });
  context("Test : init", async () => {
    it("The team get a token at deployment", async () => {
      let balance = await SHK.balanceOf(_Cus4);
      expect(balance).to.be.bignumber.equal("1");
    });
    it("The team get a token id 0", async () => {
      let id1 = new BN(0);
      let token = await SHK.getWallet.call(_Cus4);
      expect(token[0]).to.be.bignumber.equal(id1);
    });
    it("The contract is paused", async () => {
      let state = await SHK.paused.call();
      expect(state).to.be.true;
    });
  });
  context("Test: Withelisted mint", async () => {
    it("Revert A non whitelisted ", async () => {
      let price = new BN(0.08);
      await expectRevert(
        SHK.mintStep1(1, MProof1, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Not in the whitelist"
      );
    });
    it("No one can mint if the contract is paused", async () => {
      let price = "0.08";
      await expectRevert(
        SHK.mintStep1(1, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Contract paused"
      );
    });
    it("Whitelisted Addresses can mint when contract unPaused", async () => {
      await SHK.switchPause({ from: _owner });
      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddress);
      let price = "0.16";
      await SHK.mintStep1(2, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddress);
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(2));
    });
    it("Whitelisted Addresses can mint all authorized token in two calls", async () => {
      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddress);
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.mintStep1(1, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddress);
      await SHK.mintStep1(1, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance2 = await SHK.balanceOf.call(_whitelistedAddress);
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(1));
      expect(balance2).to.be.bignumber.equal(new BN(2));
    });
    it("Whitelisted Addresses cannot mint more than the maximum authorized in one call", async () => {
      await SHK.switchPause({ from: _owner });
      let price = "0.24";
      await expectRevert(
        SHK.mintStep1(3, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Requet too much for a wallet at this stage"
      );
    });
    it("Whitelisted Addresses cannot mint more than the maximum authorized in two calls", async () => {
      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddress);
      let price1 = "0.16";
      await SHK.switchPause({ from: _owner });
      await SHK.mintStep1(2, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price1, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddress);
      let price = "0.16";
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(2));
      await expectRevert(
        SHK.mintStep1(2, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Requet too much for a wallet at this stage"
      );
    });
    it("Revert Mint 1 if in step 2 ", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.setStep2({ from: _owner });

      await expectRevert(
        SHK.mintStep1(1, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Wrong step"
      );
    });
    it("Revert Mint 1 if in publicStep ", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.setpublicStep({ from: _owner });

      await expectRevert(
        SHK.mintStep1(1, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Wrong step"
      );
    });
    it("Cannot mint if the amount is 0", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await expectRevert(
        SHK.mintStep1(0, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "MintZeroQuantity()"
      );
    });
    it("Cannot mint if does not pay the right price", async () => {
      let price = "0.04";
      await SHK.switchPause({ from: _owner });

      await expectRevert(
        SHK.mintStep1(2, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Insufficient funds"
      );
    });
  });
  context("Test: Withelisted mint step2", async () => {
    it("No one can mint if the contract is paused", async () => {
      let price = "0.08";
      await SHK.setStep2({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await expectRevert(
        SHK.mintStep2(1, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Contract paused"
      );
    });
    it("No one can mint if the contract is in step 1", async () => {
      let price = "0.08";
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.switchPause({ from: _owner });
      await expectRevert(
        SHK.mintStep2(1, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Wrong step"
      );
    });
    it("No one can mint if the contract is in public step", async () => {
      let price = "0.08";
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setpublicStep({ from: _owner });
      await SHK.switchPause({ from: _owner });
      await expectRevert(
        SHK.mintStep2(1, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Wrong step"
      );
    });
    it("Revert A non whitelisted ", async () => {
      let price = new BN(0.08);
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      await expectRevert(
        SHK.mintStep1(1, Mproof3, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Not in the whitelist"
      );
    });
    it("Whitelisted Addresses can mint when contract unPaused", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      let price = "0.16";
      await SHK.mintStep2(2, Mproof3, {
        from: _whitelistedAddressMproof3,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(2));
    });
    it("Whitelisted Addresses cannot mint more than the maximum authorized", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let price = "0.88";
      await expectRevert(
        SHK.mintStep2(11, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Requet too much for a wallet at this stage"
      );
    });
    it("Whitelisted Addresses cannot mint more than the maximum authorized in two calls", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });

      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      let price1 = "0.80";

      await SHK.mintStep2(10, Mproof3, {
        from: _whitelistedAddressMproof3,
        value: web3.utils.toWei(price1, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      let price = "0.08";
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(10));
      await expectRevert(
        SHK.mintStep2(1, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Requet too much for a wallet at this stage"
      );
    });
    it("Whitelisted Addresses can mint all authorized token in two calls", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });

      let balanceBefore = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      let price = "0.72";
      let price2 = "0.08";
      await SHK.mintStep2(9, MProof1, {
        from: _whitelistedAddressMproof3,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      await SHK.mintStep2(1, MProof1, {
        from: _whitelistedAddressMproof3,
        value: web3.utils.toWei(price2, "ether"),
      });
      let balance2 = await SHK.balanceOf.call(_whitelistedAddressMproof3);
      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balance).to.be.bignumber.equal(new BN(9));
      expect(balance2).to.be.bignumber.equal(new BN(10));
    });

    it("Cannot mint if the amount is 0", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let price = "0.08";
      await expectRevert(
        SHK.mintStep2(0, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "MintZeroQuantity()"
      );
    });
    it("Cannot mint if does not pay the right price", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let price = "0.08";

      await expectRevert(
        SHK.mintStep2(2, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Insufficient funds"
      );
    });
  });
  xcontext("Test: Whitelisted mint1 specific", async () => {
    //For this test, put uint maxSupply = 2 in the code and the wallet test
    it("Revert cause request sup to supply", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });

      await expectRevert(
        SHK.mintStep1(2, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Request superior max Supply"
      );
    });
    it("The address can get one", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.mintStep1(1, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddress);

      expect(balance).to.be.bignumber.equal(new BN(1));
    });
  });
  xcontext("Test: Whitelisted mint2 specific", async () => {
    //For this test, put uint maxSupply = 2 in the code and the wallet test

    it("Revert cause request sup to supply", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let price = "0.08";

      await expectRevert(
        SHK.mintStep2(2, Mproof3, {
          from: _whitelistedAddressMproof3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Request superior max Supply"
      );
    });
    it("The address can get one", async () => {
      await SHK.switchPause({ from: _owner });
      SHK.updateMerleRoot(MerkleRootProof3, {
        from: _owner,
      });
      await SHK.setStep2({ from: _owner });
      let price = "0.08";
      await SHK.mintStep2(1, Mproof3, {
        from: _whitelistedAddressMproof3,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_whitelistedAddressMproof3);

      expect(balance).to.be.bignumber.equal(new BN(1));
    });
  });
  context("Test: Public Sale", async () => {
    it("no one can mint if the contract is paused", async () => {
      let price = "0.08";

      await expectRevert(
        SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Contract paused"
      );
    });
    it("A non whitelisted address cannot mint if not in puhlic sale", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });

      await expectRevert(
        SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Wrong step"
      );
    });
    it("A non whitelisted address can mint when in public sale", async () => {
      let price = "0.16";
      await SHK.switchPause({ from: _owner });
      await SHK.setpublicStep({ from: _owner });

      let balanceBefore = await SHK.balanceOf.call(_Cus2);
      await SHK.publicMint(2, {
        from: _Cus2,
        value: web3.utils.toWei(price, "ether"),
      });
      let balanceAfter = await SHK.balanceOf.call(_Cus2);

      expect(balanceBefore).to.be.bignumber.equal(new BN(0));
      expect(balanceAfter).to.be.bignumber.equal(new BN(2));
    });
    it("A non whitelisted address cannot mint if doesn't pay the price", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.setpublicStep({ from: _owner });

      await expectRevert(
        SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Insufficient funds"
      );
    });
  });
  xcontext("Test: Public Sale specific", async () => {
    //For this test, put uint maxSupply = 2 in the code and the wallet test
    it("Revert cause request sup to supply", async () => {
      let price = "0.16";
      await SHK.switchPause({ from: _owner });
      await SHK.setpublicStep({ from: _owner });
      await expectRevert(
        SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Request superior max Supply"
      );
    });
    it("Mint but the next one cannot mint cause we achivied the max supply", async () => {
      let price = "0.08";
      await SHK.switchPause({ from: _owner });
      await SHK.setpublicStep({ from: _owner });
      await SHK.publicMint(1, {
        from: _Cus2,
        value: web3.utils.toWei(price, "ether"),
      });
      let balance = await SHK.balanceOf.call(_Cus2);

      await expectRevert(
        SHK.publicMint(1, {
          from: _Cus3,
          value: web3.utils.toWei(price, "ether"),
        }),
        "Request superior max Supply"
      );
      expect(balance).to.be.bignumber.equal(new BN(1));
    });
  });
  context("Test: Admin command", async () => {
    describe("Pause contract", async () => {
      it("Only the owner change the pause status", async () => {
        await expectRevert.unspecified(
          SHK.switchPause({ from: _whitelistedAddress })
        );
      });
      it("The owner can unpaused the contract", async () => {
        await SHK.switchPause({ from: _owner });
        let stateContract = await SHK.paused.call();
        expect(stateContract).to.be.false;
      });

      it("The owner can paused the contract", async () => {
        await SHK.switchPause({ from: _owner });
        let stateContract = await SHK.paused.call();
        expect(stateContract).to.be.false;

        await SHK.switchPause({ from: _owner });
        let stateContract2 = await SHK.paused.call();
        expect(stateContract2).to.be.true;
      });
    });
    describe("Steps", async () => {
      it("Only the owner change the sell steps", async () => {
        await expectRevert.unspecified(
          SHK.setStep2({ from: _whitelistedAddress })
        );
        await expectRevert.unspecified(
          SHK.setpublicStep({ from: _whitelistedAddress })
        );
      });
    });
    describe("Reveal", async () => {
      it("Only the owner can reveal the img", async () => {
        await expectRevert.unspecified(
          SHK.revealNFT({ from: _whitelistedAddress })
        );
      });
      it("Cannot reveal, if the shuffle has not been made", async () => {
        await expectRevert(
          SHK.revealNFT({ from: _owner }),
          "collection hasn't been shuffled"
        );
      });
      it("Before the reveal, the URI equal the Hidden one", async () => {
        let price = "0.16";
        await SHK.switchPause({ from: _owner });
        await SHK.setpublicStep({ from: _owner });
        await SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        });

        let URI = await SHK.tokenURI(1);
        expect(URI).to.equal(
          "ipfs://QmXJnKLDqtcx41BP6iA3jxskpGE3LWQGUpHhfQVMb3Nu9X/hidden.json"
        );
      });
      xit("Specific: After the reveal, the URI equal the good one", async () => {
        //Set the shuffle = true, and s_random = 15
        let price = "0.16";
        await SHK.switchPause({ from: _owner });
        await SHK.setpublicStep({ from: _owner });
        await SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        });
        await SHK.setBaseURI(
          "ipfs://QmdsaN9anpVyKjQrUKDHxy4XJW5k2S5Mszv1GhTQq7epJF/",
          {
            from: _owner,
          }
        );
        await SHK.revealNFT({ from: _owner });

        let URI = await SHK.tokenURI(0);
        expect(URI).to.equal(
          "ipfs://QmdsaN9anpVyKjQrUKDHxy4XJW5k2S5Mszv1GhTQq7epJF/15.json"
        );
      });
    });
    describe("Price", async () => {
      it("Only the owner can change the price ", async () => {
        await expectRevert.unspecified(
          SHK.setNewPrice(1, { from: _whitelistedAddress })
        );
      });
      it("The new price is taken", async () => {
        let oldPrice = await SHK.price.call();
        await SHK.setNewPrice(new BN("500000000000000000"), { from: _owner });

        let newPrice = await SHK.price.call();

        expect(oldPrice).to.be.bignumber.equal("80000000000000000");
        expect(newPrice).to.be.bignumber.equal("500000000000000000");
      });
      it("User cannot buy if does not pay the new price", async () => {
        await SHK.setNewPrice(new BN("500000000000000000"), { from: _owner });
        let price = "0.08";
        await SHK.switchPause({ from: _owner });
        await SHK.setpublicStep({ from: _owner });

        await expectRevert(
          SHK.publicMint(2, {
            from: _Cus2,
            value: web3.utils.toWei(price, "ether"),
          }),
          "Insufficient funds"
        );
      });
    });
    describe("Withdraw", async () => {
      it("Only the owner can withdraw", async () => {
        await expectRevert(
          SHK.withdraw({ from: _whitelistedAddress }),
          "Ownable: caller is not the owner"
        );
      });
      it("Cannot withdraw if there is nothing", async () => {
        await expectRevert(
          SHK.withdraw({ from: _owner }),
          "Nothing to withdraw"
        );
      });
      it("Withraw on the team wallet", async () => {
        let price = "0.4";
        let priceWei = "400000000000000000";
        await SHK.switchPause({ from: _owner });
        await SHK.setpublicStep({ from: _owner });
        await SHK.publicMint(2, {
          from: _Cus2,
          value: web3.utils.toWei(price, "ether"),
        });

        let balanceBefore = await web3.eth.getBalance(_Cus4);

        await SHK.withdraw({ from: _owner });

        let balanceAfter = await web3.eth.getBalance(_Cus4);

        let a = parseInt(priceWei) + parseInt(balanceBefore);
        let b = parseInt(balanceAfter);
        expect(a).to.equal(b);
      });
    });
    describe("Give Away", async () => {
      it("Only the owner send give away", async () => {
        await expectRevert(
          SHK.giveAway(_Cus3, 2, { from: _whitelistedAddress }),
          "Ownable: caller is not the owner"
        );
      });
      it("The user get his give away", async () => {
        await SHK.giveAway(_Cus3, 5, { from: _owner });
        let balance = await SHK.balanceOf.call(_Cus3);

        expect(balance).to.be.bignumber.equal(new BN(5));
      });
    });
    describe("Update merkle root", async () => {
      it("Only the owner change the pause status", async () => {
        await expectRevert.unspecified(
          SHK.updateMerleRoot(
            "0x2eeb960a779ceebefa8afcbd4878272e4a3c233b936fc4a1fd8aaa88528070a6",
            {
              from: _whitelistedAddress,
            }
          )
        );
      });
      it("The owner can update the merkle root", async () => {
        await SHK.updateMerleRoot(
          "0x2eeb960a779ceebefa8afcbd4878272e4a3c233b936fc4a1fd8aaa88528070a6",
          {
            from: _owner,
          }
        );
        let stateContract = await SHK.merkleRoot.call();
        expect(stateContract).to.be.equal(
          "0x2eeb960a779ceebefa8afcbd4878272e4a3c233b936fc4a1fd8aaa88528070a6"
        );
      });
      it("An address in the new list cannot mint with the previous root but can with the new one", async () => {
        await SHK.switchPause({ from: _owner });
        await SHK.setStep2({ from: _owner });
        let price = "0.08";
        await expectRevert(
          SHK.mintStep2(1, MProof1, {
            from: _whitelistedAddress2,
            value: web3.utils.toWei(price, "ether"),
          }),
          "Not in the whitelist"
        );
        await SHK.updateMerleRoot(
          "0x51a5ce4dd0fe18c8773d664c1b6ee22885b9902ef4e87d7492c15f06f9fe86c9",
          {
            from: _owner,
          }
        );
        await SHK.mintStep2(1, Mproof2, {
          from: _whitelistedAddress2,
          value: web3.utils.toWei(price, "ether"),
        });
        let balance = await SHK.balanceOf(_whitelistedAddress2);

        expect(balance).to.be.bignumber.equal(new BN(1));
      });
    });
    describe("Update max by wallet", async () => {
      it("Only the owner can change the max by wallet", async () => {
        await expectRevert(
          SHK.updateMaxByWallet1(4, { from: _whitelistedAddress }),
          "Ownable: caller is not the owner"
        );
      });
      it("A user can buy more nft after the update", async () => {
        await SHK.switchPause({ from: _owner });
        let price = "0.32";
        let priceForOne = "0.32";

        await SHK.mintStep1(2, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(price, "ether"),
        });

        await expectRevert(
          SHK.mintStep1(2, MProof1, {
            from: _whitelistedAddress,
            value: web3.utils.toWei(price, "ether"),
          }),
          "Requet too much for a wallet"
        );
        await SHK.updateMaxByWallet1(4, { from: _owner });
        await SHK.mintStep1(2, MProof1, {
          from: _whitelistedAddress,
          value: web3.utils.toWei(priceForOne, "ether"),
        });

        let balance = await SHK.balanceOf(_whitelistedAddress);

        expect(balance).to.be.bignumber.equal(new BN(4));
      });
    });
  });
  context("Test : Public call", async () => {
    it("We get the tokenId's of a wallet ", async () => {
      let id1 = new BN(1);
      let id2 = new BN(2);
      let id3 = new BN(3);

      await SHK.switchPause({ from: _owner });
      let price = "0.16";
      let price2 = "0.08";
      await SHK.mintStep1(2, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });

      await SHK.setpublicStep({ from: _owner });

      await SHK.publicMint(1, {
        from: _Cus2,
        value: web3.utils.toWei(price2, "ether"),
      });

      let walletCus1 = await SHK.getWallet.call(_whitelistedAddress);
      let walletCus2 = await SHK.getWallet.call(_Cus2);

      expect(walletCus1[0]).to.be.bignumber.equal(id1);
      expect(walletCus1[1]).to.be.bignumber.equal(id2);
      expect(walletCus2[0]).to.be.bignumber.equal(id3);
    });
  });
  context("Global using", async () => {
    it("A  global using of the contract ", async () => {
      let price = "0.16";
      let price_8 = "0.64";
      await SHK.switchPause({ from: _owner });

      // MINT step 1

      await SHK.mintStep1(2, MProof1, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price, "ether"),
      });

      //Mint Step 2

      await SHK.updateMerleRoot(
        "0x49e10ad1944cc58fe1941b10c0808dd12eb894e381b7362d5b6e3412e4757dfe",
        {
          from: _owner,
        }
      );
      await SHK.setStep2({ from: _owner });
      await SHK.mintStep2(8, Mproof13, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price_8, "ether"),
      });

      //Public Step 3
      await SHK.setpublicStep({ from: _owner });
      await SHK.publicMint(8, {
        from: _whitelistedAddress,
        value: web3.utils.toWei(price_8, "ether"),
      });

      //Update max by wallet
      await SHK.updateMaxByWallet1(4, { from: _owner });
      await SHK.updateMaxByWallet2(4, { from: _owner });

      //Set new price
      await SHK.setNewPrice(new BN("500000000000000000"), { from: _owner });

      //Open public Burn
      await SHK.openPublicBurn({ from: _owner });

      //Give away 100
      await SHK.giveAway(_Cus2, 100, { from: _owner });

      //Burn
      await SHK.publicBurn(5, { from: _whitelistedAddress });

      //set Base
      await SHK.setBaseURI("asdcas", { from: _owner });

      //set hidden
      await SHK.setHidden("asdcas", { from: _owner });

      //Set proxy
      await SHK.setProxyAddress(_Cus2, { from: _owner });
    });
  });
});

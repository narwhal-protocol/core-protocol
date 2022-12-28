const { bnbUnsigned, bnbExp } = require("./Utils/BSC");

const { makeComptroller, makeNToken, preApprove, preSupply, quickRedeem } = require("./Utils/Narwhal");

async function nwlBalance(comptroller, user) {
  return bnbUnsigned(await call(comptroller.nwl, "balanceOf", [user]));
}

async function narwhalAccrued(comptroller, user) {
  return bnbUnsigned(await call(comptroller, "narwhalAccrued", [user]));
}

async function fastForwardPatch(patch, comptroller, blocks) {
  if (patch == "unitroller") {
    return await send(comptroller, "harnessFastForward", [blocks]);
  } else {
    return await send(comptroller, "fastForward", [blocks]);
  }
}

const fs = require("fs");
const diffStringsUnified = require("jest-diff").default;

async function preRedeem(vToken, redeemer, redeemTokens, redeemAmount) {
  await preSupply(vToken, redeemer, redeemTokens);
  await send(vToken.underlying, "harnessSetBalance", [vToken._address, redeemAmount]);
}

const getGasCostFile = name => {
  try {
    const jsonString = fs.readFileSync(name);
    return JSON.parse(jsonString);
  } catch (err) {
    console.log(err);
    return {};
  }
};

const recordGasCost = (totalFee, key, filename, opcodes = {}) => {
  let fileObj = getGasCostFile(filename);
  const newCost = { fee: totalFee, opcodes: opcodes };
  console.log(diffStringsUnified(fileObj[key], newCost));
  fileObj[key] = newCost;
  fs.writeFileSync(filename, JSON.stringify(fileObj, null, " "), "utf-8");
};

async function mint(vToken, minter, mintAmount) {
  expect(await preApprove(vToken, minter, mintAmount, {})).toSucceed();
  return send(vToken, "mint", [mintAmount], { from: minter });
}

async function claimNarwhal(comptroller, holder) {
  return send(comptroller, "claimNarwhal", [holder], { from: holder });
}

/// GAS PROFILER: saves a digest of the gas prices of common NToken operations
/// transiently fails, not sure why

describe("Gas report", () => {
  let root, minter, redeemer, accounts, vToken; // eslint-disable-line @typescript-eslint/no-unused-vars
  const exchangeRate = 50e3;
  // const preMintAmount = bnbUnsigned(30e4);
  const mintAmount = bnbUnsigned(10e4);
  const redeemTokens = bnbUnsigned(10e3);
  const redeemAmount = redeemTokens.multipliedBy(exchangeRate);
  const filename = "./gasCosts.json";

  describe("NToken", () => {
    beforeEach(async () => {
      [root, minter, redeemer, ...accounts] = saddle.accounts;
      vToken = await makeNToken({
        comptrollerOpts: { kind: "bool" },
        interestRateModelOpts: { kind: "white-paper" },
        exchangeRate,
      });
    });

    it("first mint", async () => {
      await send(vToken, "harnessSetAccrualBlockNumber", [40]);
      await send(vToken, "harnessSetBlockNumber", [41]);

      const trxReceipt = await mint(vToken, minter, mintAmount, exchangeRate);
      recordGasCost(trxReceipt.gasUsed, "first mint", filename);
    });

    it("second mint", async () => {
      await mint(vToken, minter, mintAmount, exchangeRate);

      await send(vToken, "harnessSetAccrualBlockNumber", [40]);
      await send(vToken, "harnessSetBlockNumber", [41]);

      const mint2Receipt = await mint(vToken, minter, mintAmount, exchangeRate);
      expect(Object.keys(mint2Receipt.events)).toEqual(["AccrueInterest", "Transfer", "Mint"]);

      console.log(mint2Receipt.gasUsed);
      const opcodeCount = {};

      await saddle.trace(mint2Receipt, {
        execLog: log => {
          if (log.lastLog != undefined) {
            const key = `${log.op} @ ${log.gasCost}`;
            opcodeCount[key] = (opcodeCount[key] || 0) + 1;
          }
        },
      });

      recordGasCost(mint2Receipt.gasUsed, "second mint", filename, opcodeCount);
    });

    it("second mint, no interest accrued", async () => {
      await mint(vToken, minter, mintAmount, exchangeRate);

      await send(vToken, "harnessSetAccrualBlockNumber", [40]);
      await send(vToken, "harnessSetBlockNumber", [40]);

      const mint2Receipt = await mint(vToken, minter, mintAmount, exchangeRate);
      expect(Object.keys(mint2Receipt.events)).toEqual(["Transfer", "Mint"]);
      recordGasCost(mint2Receipt.gasUsed, "second mint, no interest accrued", filename);

      // console.log("NO ACCRUED");
      // const opcodeCount = {};
      // await saddle.trace(mint2Receipt, {
      //   execLog: log => {
      //     opcodeCount[log.op] = (opcodeCount[log.op] || 0) + 1;
      //   }
      // });
      // console.log(getOpcodeDigest(opcodeCount));
    });

    it("redeem", async () => {
      await preRedeem(vToken, redeemer, redeemTokens, redeemAmount, exchangeRate);
      const trxReceipt = await quickRedeem(vToken, redeemer, redeemTokens);
      recordGasCost(trxReceipt.gasUsed, "redeem", filename);
    });

    // @FIXME
    it.skip("print mint opcode list", async () => {
      // await preMint(vToken, minter, mintAmount, mintTokens, exchangeRate);
      // const trxReceipt = await quickMint(vToken, minter, mintAmount);
      // const opcodeCount = {};
      // await saddle.trace(trxReceipt, {
      //   execLog: log => {
      //     opcodeCount[log.op] = (opcodeCount[log.op] || 0) + 1;
      //   }
      // });
    });
  });

  describe.each([["unitroller-g2"], ["unitroller"]])("XVS claims %s", patch => {
    let comptroller;
    beforeEach(async () => {
      [root, minter, redeemer, ...accounts] = saddle.accounts;
      comptroller = await makeComptroller({ kind: patch });
      let interestRateModelOpts = { borrowRate: 0.000001 };
      vToken = await makeNToken({ comptroller, supportMarket: true, underlyingPrice: 2, interestRateModelOpts });
      if (patch == "unitroller") {
        await send(comptroller, "_setNarwhalSpeed", [vToken._address, bnbExp(0.05)]);
      } else {
        await send(comptroller, "_addNarwhalMarkets", [[vToken].map(c => c._address)]);
        await send(comptroller, "setNarwhalSpeed", [vToken._address, bnbExp(0.05)]);
      }
      await send(comptroller.nwl, "transfer", [comptroller._address, bnbUnsigned(50e18)], { from: root });
    });

    it(`${patch} second mint with nwl accrued`, async () => {
      await mint(vToken, minter, mintAmount, exchangeRate);

      await fastForwardPatch(patch, comptroller, 10);

      console.log("XVS balance before mint", (await nwlBalance(comptroller, minter)).toString());
      console.log("XVS accrued before mint", (await narwhalAccrued(comptroller, minter)).toString());
      const mint2Receipt = await mint(vToken, minter, mintAmount, exchangeRate);
      console.log("XVS balance after mint", (await nwlBalance(comptroller, minter)).toString());
      console.log("XVS accrued after mint", (await narwhalAccrued(comptroller, minter)).toString());
      recordGasCost(mint2Receipt.gasUsed, `${patch} second mint with nwl accrued`, filename);
    });

    it(`${patch} claim nwl`, async () => {
      await mint(vToken, minter, mintAmount, exchangeRate);

      await fastForwardPatch(patch, comptroller, 10);

      console.log("XVS balance before claim", (await nwlBalance(comptroller, minter)).toString());
      console.log("XVS accrued before claim", (await narwhalAccrued(comptroller, minter)).toString());
      const claimReceipt = await claimNarwhal(comptroller, minter);
      console.log("XVS balance after claim", (await nwlBalance(comptroller, minter)).toString());
      console.log("XVS accrued after claim", (await narwhalAccrued(comptroller, minter)).toString());
      recordGasCost(claimReceipt.gasUsed, `${patch} claim nwl`, filename);
    });
  });
});

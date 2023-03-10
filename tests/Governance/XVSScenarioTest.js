describe("XVSScenario", () => {
  let root;
  let nwl;

  beforeEach(async () => {
    [root] = saddle.accounts;
    nwl = await deploy("XVSScenario", [root]);
  });

  describe("lookup curve", () => {
    [
      [1, 3],
      [2, 5],
      [20, 8],
      [100, 10],
      [500, 12],
      ...(process.env["SLOW"]
        ? [
            [5000, 16],
            [20000, 18],
          ]
        : []),
    ].forEach(([checkpoints, expectedReads]) => {
      it(`with ${checkpoints} checkpoints, has ${expectedReads} reads`, async () => {
        let remaining = checkpoints;
        let offset = 0;
        while (remaining > 0) {
          let amt = remaining > 1000 ? 1000 : remaining;
          await nwl.methods.generateCheckpoints(amt, offset).send({ from: root, gas: 200000000 });
          remaining -= amt;
          offset += amt;
        }

        let result = await nwl.methods.getPriorVotes(root, 1).send();

        await saddle.trace(result, {
          constants: {
            account: root,
          },
          preFilter: ({ op }) => op === "SLOAD",
          postFilter: ({ source }) => !source || !source.includes("mockBlockNumber"),
          execLog: log => {
            if (process.env["VERBOSE"]) {
              log.show();
            }
          },
          exec: logs => {
            expect(logs.length).toEqual(expectedReads);
          },
        });
      }, 600000);
    });
  });
});

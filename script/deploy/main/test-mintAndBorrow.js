const { ethers, network } = require("hardhat");
const { writeAddr } = require('../../../helpers/artifact_log.js');
const {getAddr} = require("../../../helpers/artifact_log.js");



// 20 * 60 * 24 * 365 (BlockTime: 3s)
let blocksPerYear = 10512000;
const TokenName = "WBTC"
const nTokenName = "n" + TokenName


const mintAmount = "1000000000000000000";

const borrowAmount = "200000000000000000"



async function main() {
    const [account] = await ethers.getSigners();
    // await hre.run('compile');
    // test mint

    const tokenAddr = await getAddr(TokenName, network.name);
    const nTokenAddr = await getAddr(nTokenName, network.name);

    const token = await ethers.getContractAt("MockToken", tokenAddr, account)

    await (await token.approve(nTokenAddr, "10000000000000000000000000000")).wait()

    const nToken = await ethers.getContractAt("NBep20Delegator", nTokenAddr, account)

    await (await nToken.mint(mintAmount)).wait()


    console.log("\tmint success");

    await (await nToken.borrow(borrowAmount)).wait()

    console.log("\tborrow success");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

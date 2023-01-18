const { ethers, network } = require("hardhat");
const { writeAddr } = require('../../../helpers/artifact_log.js');

async function main() {
    const [account] = await ethers.getSigners();
    //deploy NAI
    const NAI = await ethers.getContractFactory("NAI");
    const nai = await NAI.deploy(network.config.chainId, {maxPriorityFeePerGas: 1});

    await waitTx(nai.deployTransaction.hash)
    await nai.deployed();
    console.log("\tNAI deployed to:", nai.address);

    await writeAddr(nai.address, "NAI", network.name, account.address);
}
async function waitTx(txhash){
    let a = true
    while (a) {
        const tx = await ethers.provider.getTransactionReceipt(txhash);
        if (tx != null) {
            a = false
        }
        await sleep(5000)
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

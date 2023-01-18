const { ethers, upgrades, network } = require("hardhat");
const { writeAddr } = require('../../../helpers/artifact_log.js');

async function main() {
    const [account] = await ethers.getSigners();
    //deploy NWL
    const NWL = await ethers.getContractFactory("NWL");
    const nwl = await NWL.deploy(account.address, {maxPriorityFeePerGas: 1});

    await waitTx(nwl.deployTransaction.hash)
    await nwl.deployed();

    console.log("\tNWL deployed to:", nwl.address);

    await writeAddr(nwl.address, "NWL", network.name, account.address);
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

const { ethers, upgrades, network } = require("hardhat");
const { writeAddr } = require('../../../helpers/artifact_log.js');
const {getAddr} = require("../../../helpers/artifact_log.js");

//const USDT = "0x43AA9aB6A1d0737Cc56F5E01a3DF3748c5A54717"

// Parameters
const closeFactor = 0.5e18.toString();
const liquidationIncentive = 1.1e18.toString();
const NAIMintRate = "5000"; //50%


async function main() {
    const [account] = await ethers.getSigners();

    //deploy Comptroller and Unitroller
    const Comptroller = await ethers.getContractFactory("Comptroller");
    const comptroller = await Comptroller.deploy();

    const Unitroller = await ethers.getContractFactory("Unitroller");
    const unitroller = await Unitroller.deploy();

    await comptroller.deployed();
    await unitroller.deployed();

    console.log("\tComptroller deployed to:", comptroller.address);
    console.log("\tUnitroller deployed to:", unitroller.address);
    await writeAddr(comptroller.address, "Comptroller", network.name, account.address);
    await writeAddr(unitroller.address, "Unitroller", network.name, account.address);

    //set Comptroller and Unitroller proxy
    await (await unitroller._setPendingImplementation(comptroller.address)).wait();
    await (await comptroller._become(unitroller.address)).wait();

    const proxyUnitroller = await ethers.getContractAt("Comptroller", unitroller.address, account)

    //comptroller set
    await (await proxyUnitroller._setLiquidationIncentive(liquidationIncentive)).wait();
    await (await proxyUnitroller._setCloseFactor(closeFactor)).wait();

    console.log("\tproxyUnitroller set success");
    //deploy NarwhalLens
    const NarwhalLens = await ethers.getContractFactory("NarwhalLens");
    const narwhalLens = await NarwhalLens.deploy();
    await narwhalLens.deployed();
    console.log("\tNarwhalLens deployed to:", narwhalLens.address);
    await writeAddr(narwhalLens.address, "NarwhalLens", network.name, account.address);

    //deploy compoundLens
    const ComptrollerLens = await ethers.getContractFactory("ComptrollerLens");
    const comptrollerLens = await ComptrollerLens.deploy();
    await comptrollerLens.deployed();
    console.log("\tComptrollerLens deployed to:", comptrollerLens.address);
    await writeAddr(comptrollerLens.address, "ComptrollerLens", network.name, account.address);

    //set comptrollerLens
    await (await proxyUnitroller._setComptrollerLens(comptrollerLens.address)).wait();

    //deploy NAIComptroller and NAIUnitroller
    const NAIController = await ethers.getContractFactory("NAIController");
    const naiController = await NAIController.deploy();

    const NAIUnitroller = await ethers.getContractFactory("NAIUnitroller");
    const naiUnitroller = await NAIUnitroller.deploy();

    await naiController.deployed();
    await naiUnitroller.deployed();

    console.log("\tNAIController deployed to:", naiController.address);
    console.log("\tNAIUnitroller deployed to:", naiUnitroller.address);
    await writeAddr(naiController.address, "NAIController", network.name, account.address);
    await writeAddr(naiUnitroller.address, "NAIUnitroller", network.name, account.address);

    //set NAIComptroller and NAIUnitroller proxy
    await (await naiUnitroller._setPendingImplementation(naiController.address)).wait();
    await (await naiController._become(naiUnitroller.address)).wait();

    const proxyNAIUnitroller = await ethers.getContractAt("NAIController", naiUnitroller.address, account)

    await (await proxyNAIUnitroller._setComptroller(unitroller.address)).wait();
    await (await proxyNAIUnitroller.initialize()).wait();
    //set NAIComptroller
    await (await proxyUnitroller._setNAIController(naiUnitroller.address)).wait();

    await (await proxyUnitroller._setNAIMintRate(NAIMintRate)).wait();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

const {ethers} = require("hardhat");

function getInitAllMarketsInfo() {
    return [{
        tokenName: "WBTC",
        supplyCap: ethers.utils.parseUnits("1000000000"),
        collateralFactor: ethers.utils.parseUnits("0.8"),
        reserveFactor:ethers.utils.parseUnits("0.2"),
        initialExchangeRate:'200000000000000000000000000',
        nwlBlockRate: "13020833333333333",
        baseRatePerYear: "0",
        multiplierPerYear: ethers.utils.parseUnits("0.1267"),
        jumpMultiplierPerYear: ethers.utils.parseUnits("2"),
        kink: ethers.utils.parseUnits("0.75")
    },
        {
            tokenName: "WETH",
            supplyCap: ethers.utils.parseUnits("1000000000"),
            collateralFactor: ethers.utils.parseUnits("0.8"),
            reserveFactor:ethers.utils.parseUnits("0.2"),
            initialExchangeRate:'200000000000000000000000000',
            nwlBlockRate: "6510416666666667",
            baseRatePerYear: "0",
            multiplierPerYear: ethers.utils.parseUnits("0.1267"),
            jumpMultiplierPerYear: ethers.utils.parseUnits("2"),
            kink: ethers.utils.parseUnits("0.75")
        },
        {
            tokenName: "FIL",
            supplyCap: ethers.utils.parseUnits("1000000000"),
            collateralFactor: ethers.utils.parseUnits("0.5"),
            reserveFactor:ethers.utils.parseUnits("0.2"),
            initialExchangeRate:'200000000000000000000000000',
            nwlBlockRate: "217013888888889",
            baseRatePerYear: ethers.utils.parseUnits("0.02"),
            multiplierPerYear: ethers.utils.parseUnits("0.2"),
            jumpMultiplierPerYear: ethers.utils.parseUnits("3"),
            kink: ethers.utils.parseUnits("0.5")
        },
        {
            tokenName: "BNB",
            supplyCap: ethers.utils.parseUnits("1000000000"),
            collateralFactor: ethers.utils.parseUnits("0.8"),
            reserveFactor:ethers.utils.parseUnits("0.2"),
            initialExchangeRate:'200000000000000000000000000',
            nwlBlockRate: ethers.utils.parseUnits("0.0001"),
            baseRatePerYear: "0",
            multiplierPerYear: ethers.utils.parseUnits("0.12"),
            jumpMultiplierPerYear: ethers.utils.parseUnits("2"),
            kink: ethers.utils.parseUnits("0.75")
        },
        {
            tokenName: "NAI",
            supplyCap: ethers.utils.parseUnits("1000000000"),
            collateralFactor: ethers.utils.parseUnits("0.8"),
            reserveFactor:ethers.utils.parseUnits("0.1"),
            initialExchangeRate:'200000000000000000000000000',
            nwlBlockRate: "5425347222222222",
            baseRatePerYear: "0",
            multiplierPerYear: ethers.utils.parseUnits("0.05"),
            jumpMultiplierPerYear: ethers.utils.parseUnits("1.09"),
            kink: ethers.utils.parseUnits("0.8")
        }
    ]
};

function getAllClaimInfo() {
    return [{
        asset: "WBTC",
        addr: '0xa7E48177021787Bf8F5C7B421Cd8Bcdcd2c31Cd2',
        frozenDuration: '86400',
        decimals:18,
        maxToClaimed: ethers.utils.parseUnits("0.1"),
    },
        {
            asset: "WETH",
            addr: '0x318C9a66291A884952Ec6Caf8905DfC2b25f8EF6',
            frozenDuration: '86400',
            decimals:18,
            maxToClaimed: ethers.utils.parseUnits("0.5"),
        },
        {
            asset: "FIL",
            addr: '0x9C69e0F1d37e1DFF28F64eDC0e8eAd67ad6C4507',
            frozenDuration: '86400',
            decimals:18,
            maxToClaimed: ethers.utils.parseUnits("100"),
        },
        {
            asset: "NWL",
            addr: '0xa9D48D0b6F8e814418F6DD426E19Ea784893Dcf9',
            frozenDuration: '86400',
            decimals:18,
            maxToClaimed: ethers.utils.parseUnits("200"),
        },
        {
            asset: "NAI",
            addr: '0xE164c3Cd64e477094b77AcA4f73B2175FF47572e',
            frozenDuration: '86400',
            decimals:18,
            maxToClaimed: ethers.utils.parseUnits("200"),
        }
    ]
};

module.exports = {
    getInitAllMarketsInfo,
    getAllClaimInfo
}
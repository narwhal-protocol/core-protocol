import { Contract } from "../Contract";
import { encodedNumber } from "../Encoding";
import { Callable, Sendable } from "../Invokation";

interface ComptrollerMethods {
  getAccountLiquidity(string): Callable<{ 0: number; 1: number; 2: number }>;
  getHypotheticalAccountLiquidity(
    account: string,
    asset: string,
    redeemTokens: encodedNumber,
    borrowAmount: encodedNumber,
  ): Callable<{ 0: number; 1: number; 2: number }>;
  membershipLength(string): Callable<string>;
  checkMembership(user: string, vToken: string): Callable<string>;
  getAssetsIn(string): Callable<string[]>;
  admin(): Callable<string>;
  oracle(): Callable<string>;
  maxAssets(): Callable<number>;
  liquidationIncentiveMantissa(): Callable<number>;
  closeFactorMantissa(): Callable<number>;
  getBlockNumber(): Callable<number>;
  collateralFactor(string): Callable<string>;
  markets(string): Callable<{ 0: boolean; 1: number; 2?: boolean }>;
  _setMaxAssets(encodedNumber): Sendable<number>;
  _setLiquidationIncentive(encodedNumber): Sendable<number>;
  _setLiquidatorContract(string): Sendable<void>;
  _supportMarket(string): Sendable<number>;
  _setPriceOracle(string): Sendable<number>;
  _setCollateralFactor(string, encodedNumber): Sendable<number>;
  _setCloseFactor(encodedNumber): Sendable<number>;
  _setVAIMintRate(encodedNumber): Sendable<number>;
  _setVAIController(string): Sendable<number>;
  enterMarkets(markets: string[]): Sendable<number>;
  exitMarket(market: string): Sendable<number>;
  fastForward(encodedNumber): Sendable<number>;
  _setComptrollerLens(string): Sendable<number>;
  _setPendingImplementation(string): Sendable<number>;
  comptrollerImplementation(): Callable<string>;
  unlist(string): Sendable<void>;
  pendingAdmin(): Callable<string>;
  _setPendingAdmin(string): Sendable<number>;
  _acceptAdmin(): Sendable<number>;
  _setProtocolPaused(bool): Sendable<number>;
  protocolPaused(): Callable<boolean>;
  _addNarwhalMarkets(markets: string[]): Sendable<void>;
  _dropNarwhalMarket(market: string): Sendable<void>;
  getNarwhalMarkets(): Callable<string[]>;
  refreshNarwhalSpeeds(): Sendable<void>;
  narwhalRate(): Callable<number>;
  narwhalSupplyState(string): Callable<string>;
  narwhalBorrowState(string): Callable<string>;
  narwhalAccrued(string): Callable<string>;
  narwhalSupplierIndex(market: string, account: string): Callable<string>;
  narwhalBorrowerIndex(market: string, account: string): Callable<string>;
  narwhalSpeeds(string): Callable<string>;
  claimNarwhal(string): Sendable<void>;
  _grantXVS(account: string, encodedNumber): Sendable<void>;
  _setNarwhalRate(encodedNumber): Sendable<void>;
  _setNarwhalSpeed(vToken: string, encodedNumber): Sendable<void>;
  mintedVAIs(string): Callable<number>;
  _setMarketBorrowCaps(vTokens: string[], borrowCaps: encodedNumber[]): Sendable<void>;
  _setMarketSupplyCaps(vTokens: string[], supplyCaps: encodedNumber[]): Sendable<void>;
  _setBorrowCapGuardian(string): Sendable<void>;
  borrowCapGuardian(): Callable<string>;
  borrowCaps(string): Callable<string>;
  supplyCaps(string): Callable<string>;
  _setTreasuryData(guardian, address, percent: encodedNumber): Sendable<number>;
}

export interface Comptroller extends Contract {
  methods: ComptrollerMethods;
}

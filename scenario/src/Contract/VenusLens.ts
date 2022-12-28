import { Contract } from "../Contract";

export interface NarwhalLensMethods {
  vTokenBalances(vToken: string, account: string): Sendable<[string, number, number, number, number, number]>;
  vTokenBalancesAll(vTokens: string[], account: string): Sendable<[string, number, number, number, number, number][]>;
  vTokenMetadata(
    vToken: string,
  ): Sendable<
    [
      string,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      boolean,
      number,
      string,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
  >;
  vTokenMetadataAll(
    vTokens: string[],
  ): Sendable<
    [
      string,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      boolean,
      number,
      string,
      number,
      number,
      number,
      number,
      number,
      number,
    ][]
  >;
  vTokenUnderlyingPrice(vToken: string): Sendable<[string, number]>;
  vTokenUnderlyingPriceAll(vTokens: string[]): Sendable<[string, number][]>;
  getAccountLimits(comptroller: string, account: string): Sendable<[string[], number, number]>;
}

export interface NarwhalLens extends Contract {
  methods: NarwhalLensMethods;
  name: string;
}

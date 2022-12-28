import { buildXVSVaultImpl } from "../Builder/XVSVaultImplBuilder";
import { Arg, Command, processCommandEvent } from "../Command";
import { XVSVault } from "../Contract/XVSVault";
import { getXVSVault } from "../ContractLookup";
import { getAddressV, getEventV, getNumberV } from "../CoreValue";
import { NoErrorReporter } from "../ErrorReporter";
import { Event } from "../Event";
import { invoke } from "../Invokation";
import { AddressV, EventV, NumberV } from "../Value";
import { World, addAction } from "../World";

async function genXVSVault(world: World, from: string, params: Event): Promise<World> {
  const { world: nextWorld, nwlVaultImpl, nwlVaultData } = await buildXVSVaultImpl(world, from, params);
  world = nextWorld;

  world = addAction(
    world,
    `Deployed immutable XVS Vault (${nwlVaultImpl.name}) to address ${nwlVaultImpl._address}`,
    nwlVaultData.invokation,
  );

  return world;
}

async function delegate(world: World, from: string, nwlVault: XVSVault, account: string): Promise<World> {
  const invokation = await invoke(world, nwlVault.methods.delegate(account), from, NoErrorReporter);

  world = addAction(world, `"Delegated from" ${from} to ${account}`, invokation);

  return world;
}

async function setNwlStore(
  world: World,
  from: string,
  nwlVault: XVSVault,
  nwl: string,
  nwlStore: string,
): Promise<World> {
  const invokation = await invoke(world, nwlVault.methods.setNwlStore(nwl, nwlStore), from, NoErrorReporter);

  world = addAction(
    world,
    `Configured XVS=${nwl}, XVSStore=${nwlStore} in the XVSVault (${nwlVault._address})`,
    invokation,
  );

  return world;
}

async function addPool(
  world: World,
  from: string,
  nwlVault: XVSVault,
  rewardToken: string,
  allocPoint: NumberV,
  token: string,
  rewardPerBlock: NumberV,
  lockPeriod: NumberV,
): Promise<World> {
  const invokation = await invoke(
    world,
    nwlVault.methods.add(rewardToken, allocPoint.encode(), token, rewardPerBlock.encode(), lockPeriod.encode()),
    from,
    NoErrorReporter,
  );

  world = addAction(world, `Added new (${token}, ${rewardToken}) pool to XVSVault (${nwlVault._address})`, invokation);

  return world;
}

async function deposit(
  world: World,
  from: string,
  nwlVault: XVSVault,
  rewardToken: string,
  pid: NumberV,
  amount: NumberV,
): Promise<World> {
  const invokation = await invoke(
    world,
    nwlVault.methods.deposit(rewardToken, pid.toNumber(), amount.encode()),
    from,
    NoErrorReporter,
  );

  world = addAction(
    world,
    `Deposited ${amount.toString()} tokens to pool (${rewardToken}, ${pid.toNumber()})
     in the XVSVault (${nwlVault._address})`,
    invokation,
  );

  return world;
}

async function requestWithdrawal(
  world: World,
  from: string,
  nwlVault: XVSVault,
  rewardToken: string,
  pid: NumberV,
  amount: NumberV,
): Promise<World> {
  const invokation = await invoke(
    world,
    nwlVault.methods.requestWithdrawal(rewardToken, pid.toNumber(), amount.encode()),
    from,
    NoErrorReporter,
  );

  world = addAction(
    world,
    `Requested withdrawal of ${amount.toString()} tokens from pool (${rewardToken}, ${pid.toNumber()})
     in the XVSVault (${nwlVault._address})`,
    invokation,
  );

  return world;
}

async function executeWithdrawal(
  world: World,
  from: string,
  nwlVault: XVSVault,
  rewardToken: string,
  pid: NumberV,
): Promise<World> {
  const invokation = await invoke(
    world,
    nwlVault.methods.executeWithdrawal(rewardToken, pid.toNumber()),
    from,
    NoErrorReporter,
  );

  world = addAction(
    world,
    `Executed withdrawal of tokens from pool (${rewardToken}, ${pid.toNumber()})
     in the XVSVault (${nwlVault._address})`,
    invokation,
  );

  return world;
}

async function setWithdrawalLockingPeriod(
  world: World,
  from: string,
  nwlVault: XVSVault,
  rewardToken: string,
  pid: NumberV,
  newPeriod: NumberV,
): Promise<World> {
  const invokation = await invoke(
    world,
    nwlVault.methods.setWithdrawalLockingPeriod(rewardToken, pid.toNumber(), newPeriod.toNumber()),
    from,
    NoErrorReporter,
  );

  world = addAction(
    world,
    `Set lock period to ${newPeriod.toString()} in the XVSVault (${nwlVault._address})`,
    invokation,
  );

  return world;
}

export function nwlVaultCommands() {
  return [
    new Command<{ params: EventV }>(
      `
        #### Deploy

        * "Deploy ...params" - Generates a new XVS Vault (non-proxy version)
        * E.g. "XVSVault Deploy MyVaultImpl"
      `,
      "Deploy",
      [new Arg("params", getEventV, { variadic: true })],
      (world, from, { params }) => genXVSVault(world, from, params.val),
    ),

    new Command<{ nwlVault: XVSVault; account: AddressV }>(
      `
        #### Delegate

        * "XVSVault Delegate account:<Address>" - Delegates votes to a given account
        * E.g. "XVSVault Delegate Torrey"
      `,
      "Delegate",
      [new Arg("nwlVault", getXVSVault, { implicit: true }), new Arg("account", getAddressV)],
      (world, from, { nwlVault, account }) => delegate(world, from, nwlVault, account.val),
    ),

    new Command<{ nwlVault: XVSVault; nwl: AddressV; nwlStore: AddressV }>(
      `
        #### SetNwlStore

        * "XVSVault SetNwlStore nwl:<Address> nwlStore:<Address>" - Configures XVS and XVSStore addresses in the vault
        * E.g. "XVSVault SetNwlStore (Address XVS) (Address XVSStore)"
      `,
      "SetNwlStore",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("nwl", getAddressV),
        new Arg("nwlStore", getAddressV),
      ],
      (world, from, { nwlVault, nwl, nwlStore }) => setNwlStore(world, from, nwlVault, nwl.val, nwlStore.val),
    ),

    new Command<{
      nwlVault: XVSVault;
      rewardToken: AddressV;
      allocPoint: NumberV;
      token: AddressV;
      rewardPerBlock: NumberV;
      lockPeriod: NumberV;
    }>(
      `
        #### Add

        * "XVSVault Add rewardToken:<Address> allocPoint:<Number> token:<Address> rewardPerBlock:<Number>"
            - Adds a new token pool
        * E.g. "XVSVault Add (Address XVS) 1000 (Address XVS) 12345"
      `,
      "Add",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("rewardToken", getAddressV),
        new Arg("allocPoint", getNumberV),
        new Arg("token", getAddressV),
        new Arg("rewardPerBlock", getNumberV),
        new Arg("lockPeriod", getNumberV),
      ],
      (world, from, { nwlVault, rewardToken, allocPoint, token, rewardPerBlock, lockPeriod }) =>
        addPool(world, from, nwlVault, rewardToken.val, allocPoint, token.val, rewardPerBlock, lockPeriod),
    ),

    new Command<{
      nwlVault: XVSVault;
      rewardToken: AddressV;
      pid: NumberV;
      amount: NumberV;
    }>(
      `
        #### Deposit

        * "XVSVault Deposit rewardToken:<Address> pid:<Number> amount:<Number>"
            - Deposits tokens to the pool identified by (rewardToken, pid) pair
        * E.g. "XVSVault Deposit (Address XVS) 42 12345"
      `,
      "Deposit",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("rewardToken", getAddressV),
        new Arg("pid", getNumberV),
        new Arg("amount", getNumberV),
      ],
      (world, from, { nwlVault, rewardToken, pid, amount }) =>
        deposit(world, from, nwlVault, rewardToken.val, pid, amount),
    ),

    new Command<{
      nwlVault: XVSVault;
      rewardToken: AddressV;
      pid: NumberV;
      amount: NumberV;
    }>(
      `
        #### RequestWithdrawal

        * "XVSVault RequestWithdrawal rewardToken:<Address> pid:<Number> amount:<Number>"
            - Submits a withdrawal request
        * E.g. "XVSVault RequestWithdrawal (Address XVS) 42 12345"
      `,
      "RequestWithdrawal",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("rewardToken", getAddressV),
        new Arg("pid", getNumberV),
        new Arg("amount", getNumberV),
      ],
      (world, from, { nwlVault, rewardToken, pid, amount }) =>
        requestWithdrawal(world, from, nwlVault, rewardToken.val, pid, amount),
    ),

    new Command<{
      nwlVault: XVSVault;
      rewardToken: AddressV;
      pid: NumberV;
    }>(
      `
        #### ExecuteWithdrawal

        * "XVSVault ExecuteWithdrawal rewardToken:<Address> pid:<Number>"
            - Executes all requests eligible for withdrawal in a certain pool
        * E.g. "XVSVault ExecuteWithdrawal (Address XVS) 42"
      `,
      "ExecuteWithdrawal",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("rewardToken", getAddressV),
        new Arg("pid", getNumberV),
      ],
      (world, from, { nwlVault, rewardToken, pid }) => executeWithdrawal(world, from, nwlVault, rewardToken.val, pid),
    ),

    new Command<{
      nwlVault: XVSVault;
      rewardToken: AddressV;
      pid: NumberV;
      newPeriod: NumberV;
    }>(
      `
        #### SetWithdrawalLockingPeriod

        * "XVSVault SetWithdrawalLockingPeriod rewardToken:<Address> pid:<Number> newPeriod:<Number>"
            - Sets the locking period for withdrawals
        * E.g. "XVSVault SetWithdrawalLockingPeriod (Address XVS) 0 42"
      `,
      "SetWithdrawalLockingPeriod",
      [
        new Arg("nwlVault", getXVSVault, { implicit: true }),
        new Arg("rewardToken", getAddressV),
        new Arg("pid", getNumberV),
        new Arg("newPeriod", getNumberV),
      ],
      (world, from, { nwlVault, rewardToken, pid, newPeriod }) =>
        setWithdrawalLockingPeriod(world, from, nwlVault, rewardToken.val, pid, newPeriod),
    ),
  ];
}

export async function processXVSVaultEvent(world: World, event: Event, from: string | null): Promise<World> {
  return await processCommandEvent<any>("XVSVault", nwlVaultCommands(), world, event, from);
}

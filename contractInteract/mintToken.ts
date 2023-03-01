import { Address, beginCell, CellMessage, CommonMessageInfo, InternalMessage, SendMode, StateInit, toNano, Wallet, WalletContract, WalletV3R1Source,WalletV3R2Source,WalletContractType, AllWalletContractTypes } from "ton";
import { internalMessage, randomAddress } from "../test/helpers";
import { parseJettonDetails, parseJettonWalletDetails } from "../test/lib/jetton-utils";
import { JettonMinter } from "../test/lib/jetton-minter";
import { actionToMessage } from "../test/lib/utils";
import { JettonWallet } from "../test/lib/jetton-wallet";
import {
  JETTON_WALLET_CODE,
  JETTON_MINTER_CODE,
  jettonMinterInitData,
} from "../build/jetton-minter.deploy";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";
import dotenv from "dotenv";
dotenv.config();
let deployerMnemonic
//DEPLOYER_MNEMONIC
export async function run(){
 
  const MINTER_ADDRESS= Address.parse("EQB9_5FlJ12AAKM7PvMb2uXD0ZudLsndcjvPMnN7C9dThN4c")
  const OWNER_ADDRESS= Address.parse("EQDEs6cUst1Tr7au9mXQHUzLQXVDnOFG_nADg8-7U3p5tJwF")
  deployerMnemonic=process.env.DEPLOYER_MNEMONIC
  const endpoint = await getHttpEndpoint({
    network: "testnet",
  });
  const client = new TonClient({ endpoint }); 
  const walletKey = await mnemonicToWalletKey(deployerMnemonic.split(" "));
  const workchain=0
  const walletContract = WalletContract.create(client, WalletV3R2Source.create({ publicKey: walletKey.publicKey, workchain })); 
  console.log(` - Wallet address used to deploy from is: ${walletContract.address.toFriendly()}`);
  console.log("Owner address:",OWNER_ADDRESS.toFriendly())
  const seqno = await walletContract.getSeqNo();
  console.log("Seqno:",seqno)
  // initialize ton library
  

  const getJWalletContract = async (
    walletOwnerAddress: Address,
    jettonMasterAddress: Address
  ): Promise<JettonWallet> =>
    await JettonWallet.create(
      JETTON_WALLET_CODE,
      beginCell()
        .storeCoins(0)
        .storeAddress(walletOwnerAddress)
        .storeAddress(jettonMasterAddress)
        .storeRef(JETTON_WALLET_CODE)
        .endCell()
    );
  const jwallet=await getJWalletContract(walletContract.address,MINTER_ADDRESS)
  console.log("J-Wallet Address:",jwallet.address.toFriendly())
  let minterContract
  const dataCell = jettonMinterInitData(OWNER_ADDRESS, {
    name: "AEASO",
    symbol: "JET1",
    description: "My jetton",
    image:"https://ipfs.io/ipfs/QmXDe1D1qdhguwx1DHBJQ9d6nZgZNZC2CEX3riuq5myVAA?filename=Conan_the_Barbarian_Vol_1_93.webp"
  });
  minterContract = (await JettonMinter.create(JETTON_MINTER_CODE, dataCell)) as JettonMinter;
  walletContract.source
  console.log("Minter contract address:",minterContract.address)
  const openedWallet=walletContract.client.openWalletFromSecretKey({workchain:0,
                                                                    secretKey:walletKey.secretKey,
                                                                    type:"org.ton.wallets.v3.r2"         })
    console.log("You r opening this wallet:",openedWallet.address.toFriendly())
   openedWallet.prepareFromSource(walletContract.source)
  await openedWallet.transfer({
    seqno:seqno,
    to:MINTER_ADDRESS,
    value:toNano(0.5),
    secretKey:walletKey.secretKey,
    bounce:false,
    payload:JettonMinter.mintBody(OWNER_ADDRESS,toNano(0.1))
  }) 
  return
}

run();

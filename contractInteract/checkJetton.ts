
import { Address, beginCell, Slice, toNano } from "ton";
import { internalMessage, randomAddress } from "../test/helpers";
import { parseJettonDetails, parseJettonWalletDetails } from "../test/lib/jetton-utils";
import { JettonMinter } from "../test/lib/jetton-minter";
import { actionToMessage } from "../test/lib/utils";
import { JettonWallet } from "../test/lib/jetton-wallet";
import { BN} from "bn.js";
import {
  JETTON_WALLET_CODE,
  JETTON_MINTER_CODE,
  jettonMinterInitData,
  parseTokenMetadataCell,
} from "../build/jetton-minter.deploy";
import { Cell } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "ton";



const MINTER_ADDRESS= Address.parse("EQB9_5FlJ12AAKM7PvMb2uXD0ZudLsndcjvPMnN7C9dThN4c")
const OWNER_ADDRESS= Address.parse("EQDEs6cUst1Tr7au9mXQHUzLQXVDnOFG_nADg8-7U3p5tJwF")
let minterContract
export async function main(){

// get the decentralized RPC endpoint
const endpoint = await getHttpEndpoint({
  network: "testnet",
}); 

// initialize ton library
const client = new TonClient({ endpoint });
//invoke get_jeton_data method and use the data to gain info...
 const{gas_used,stack}= await client.callGetMethod(MINTER_ADDRESS,"get_jetton_data",[])
 console.log("Stack address:",stack[2][1])
 const adminaddressCell=Cell.fromBoc(Buffer.from(stack[2][1].bytes,'base64'))[0];
 const admin_address=adminaddressCell.beginParse().readAddress()?.toFriendly({testOnly:true})
 console.log("Gas used:",gas_used)
 console.log("Admin address:",admin_address)
 await sleep(1000);//-->api can return request only once in second so we need delay...
 //Get Metadata and log it on terminal...
 const contentCell=Cell.fromBoc(Buffer.from(stack[3][1].bytes,'base64'))[0]
 const metadata= parseTokenMetadataCell(contentCell)
 console.log("Metadata:",metadata)
 await sleep(1000)

 const isDeployed=await client.isContractDeployed(MINTER_ADDRESS)
 console.log("Deployed ?",isDeployed)
 //creating cell for get_wallet_address method...this address made for owner_address
 const cellBoc= beginCell()
 .storeAddress(OWNER_ADDRESS)
 .endCell()
 .toBoc({idx:false})
 .toString("base64")

 const wallet_address= await client.callGetMethod(MINTER_ADDRESS,"get_wallet_address",[["tvm.Slice",cellBoc]])
  console.log("Wallet Address:",wallet_address.stack[0][1])
  
  const res=Cell.fromBoc(Buffer.from(wallet_address.stack[0][1].bytes,'base64'))[0]
  const friendlyAddress=res.beginParse().readAddress()?.toFriendly({testOnly:true})
  console.log("Jetton-->Wallet Address:",friendlyAddress)
}
main();

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }






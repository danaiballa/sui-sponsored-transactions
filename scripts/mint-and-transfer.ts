import { testnetConnection, JsonRpcProvider, TransactionBlock, RawSigner, SuiTransactionBlockResponse } from "@mysten/sui.js";
import { getKeyPair } from "./helpers";

const { execSync } = require('child_process');
import * as dotenv from "dotenv";
dotenv.config();

const adminPrivKey = process.env.ADMIN_PRIVATE_KEY!;
const userPrivKey = process.env.USER_PRIVATE_KEY!;

const packageID = process.env.PACKAGE_ID!;
const mintCapID = process.env.MINT_CAP_ID!;

const adminKeyPair = getKeyPair(adminPrivKey);
const userKeyPair = getKeyPair(userPrivKey);

const userAddress = userKeyPair.getPublicKey().toSuiAddress();

const provider = new JsonRpcProvider(testnetConnection);
const admin = new RawSigner(adminKeyPair, provider);

async function mintAndTransfer(): Promise<SuiTransactionBlockResponse> {

  let txb = new TransactionBlock();

  let dummyNft = txb.moveCall({
    target: `${packageID}::dummy_nft::mint`,
    arguments: [
        txb.object(mintCapID),
        txb.pure(3)
    ]
  });

  txb.transferObjects([dummyNft], txb.pure(userAddress));

  let result = await admin.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    requestType: "WaitForLocalExecution",
    options: {
      showEffects: true,
      showObjectChanges: true
    },
  })

  return result;
}

async function main(){
  let result = await mintAndTransfer();
  var fs = require('fs');
  fs.writeFile(`./tx-results/mintAndTransferResult.json`, JSON.stringify(result, null, 2), function(err: any) {
    if (err) {
        console.log(err);
    }
  });
}

main();
  

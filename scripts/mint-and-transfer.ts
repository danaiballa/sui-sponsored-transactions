import { TransactionBlock, SuiTransactionBlockResponse } from "@mysten/sui.js";
import {PACKAGE_ID, MINT_CAP_ID, USER_ADDRESS, adminSigner} from "./setup";

async function mintAndTransfer(): Promise<SuiTransactionBlockResponse> {

  let txb = new TransactionBlock();

  let dummyNft = txb.moveCall({
    target: `${PACKAGE_ID}::dummy_nft::mint`,
    arguments: [
        txb.object(MINT_CAP_ID),
        txb.pure(3)
    ]
  });

  txb.transferObjects([dummyNft], txb.pure(USER_ADDRESS));

  let result = await adminSigner.signAndExecuteTransactionBlock({
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
  

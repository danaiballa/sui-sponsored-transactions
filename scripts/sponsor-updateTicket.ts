import {TransactionBlock, SuiTransactionBlockResponse } from "@mysten/sui.js";
import { MINT_CAP_ID, PACKAGE_ID, USER_ADDRESS, testnetProvider, ADMIN_ADDRESS, adminSigner, userSigner} from "./setup";

const nftId = "0x4ae7748910ff1d0cd50dd259a04ff2d4977c0ff4f07f55de29199e9702d9f2ed"

// admin creates an update ticket for the user's nft and the user sponsors the gas
async function sponsorUpdate(): Promise<SuiTransactionBlockResponse> {

  let txb = new TransactionBlock();

  let updateTicket = txb.moveCall({
    target: `${PACKAGE_ID}::dummy_nft::create_update_ticket`,
    arguments: [
      txb.object(MINT_CAP_ID),
      txb.pure(nftId),
      txb.pure(4)
    ]
  })

  txb.transferObjects([updateTicket], txb.pure(USER_ADDRESS));

  txb.setSender(ADMIN_ADDRESS);
  txb.setGasOwner(USER_ADDRESS);

  const txBytes = await txb.build({ provider: testnetProvider });

  const { transactionBlockBytes: _txb1, signature: signatureSender } =
    await adminSigner.signTransactionBlock({ transactionBlock: txBytes });
  const { transactionBlockBytes: _txb2, signature: signatureSponsor } =
    await userSigner.signTransactionBlock({ transactionBlock: txBytes });

  const response = await testnetProvider.executeTransactionBlock({
    transactionBlock: txBytes,
    signature: [signatureSender, signatureSponsor],
    options: {
      showEffects: true,
      showObjectChanges: true
    },
    })
  
  return response;
}

async function main(){

  let result = await sponsorUpdate();

  var fs = require('fs');
  fs.writeFile(`./tx-results/sponsorUpdateResult.json`, JSON.stringify(result, null, 2), function(err: any) {
    if (err) {
        console.log(err);
    }
  });
}

main();


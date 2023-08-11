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

const adminAddress = adminKeyPair.getPublicKey().toSuiAddress();
const userAddress = userKeyPair.getPublicKey().toSuiAddress();

const provider = new JsonRpcProvider(testnetConnection);

const admin = new RawSigner(adminKeyPair, provider);
const user = new RawSigner(userKeyPair, provider);

const nftId = "0x4ae7748910ff1d0cd50dd259a04ff2d4977c0ff4f07f55de29199e9702d9f2ed"

// admin creates an update ticket for the user's nft and the user sponsors the gas
async function sponsorUpdate(): Promise<SuiTransactionBlockResponse> {

  let txb = new TransactionBlock();

  let updateTicket = txb.moveCall({
    target: `${packageID}::dummy_nft::create_update_ticket`,
    arguments: [
      txb.object(mintCapID),
      txb.pure(nftId),
      txb.pure(4)
    ]
  })

  txb.transferObjects([updateTicket], txb.pure(userAddress));

  txb.setSender(adminAddress);
  txb.setGasOwner(userAddress);

  const txBytes = await txb.build({ provider});

  const { transactionBlockBytes: _txb1, signature: signatureSender } =
    await admin.signTransactionBlock({ transactionBlock: txBytes });
  const { transactionBlockBytes: _txb2, signature: signatureSponsor } =
    await user.signTransactionBlock({ transactionBlock: txBytes });

  const response = await provider.executeTransactionBlock({
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


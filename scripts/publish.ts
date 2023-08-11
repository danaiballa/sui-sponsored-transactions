import { testnetConnection, JsonRpcProvider, TransactionBlock, RawSigner } from "@mysten/sui.js";
import { getKeyPair } from "./helpers";

const { execSync } = require('child_process');
import * as dotenv from "dotenv";
dotenv.config();

const privKey: string = process.env.ADMIN_PRIVATE_KEY!;
const packagePath: string = process.env.PACKAGE_PATH!;
const cliPath: string = process.env.CLI_PATH!;

let keyPair = getKeyPair(privKey);
let mugenAddress = keyPair.getPublicKey().toSuiAddress();

const provider = new JsonRpcProvider(testnetConnection);
const signer = new RawSigner(keyPair, provider);
const { modules, dependencies } = JSON.parse(
	execSync(`${cliPath} move build --dump-bytecode-as-base64 --path ${packagePath}`, {
		encoding: 'utf-8',
	}),
);

async function publish() {
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({
    modules,
    dependencies,
  });
  tx.transferObjects([upgradeCap], tx.pure(mugenAddress));
  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    requestType: "WaitForLocalExecution",
    options: {
      showEffects: true,
      showObjectChanges: true
    },
  });
  var fs = require('fs');
  fs.writeFile(`./tx-results/publishResult.json`, JSON.stringify(result, null, 2), function(err: any) {
    if (err) {
        console.log(err);
    }
  });
}

publish();

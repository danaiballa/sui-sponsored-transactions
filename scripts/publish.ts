import { TransactionBlock } from "@mysten/sui.js";
import { ADMIN_ADDRESS, CLI_PATH, PACKAGE_PATH, adminSigner    } from "./setup";

const { execSync } = require('child_process');

const { modules, dependencies } = JSON.parse(
	execSync(`${CLI_PATH} move build --dump-bytecode-as-base64 --path ${PACKAGE_PATH}`, {
		encoding: 'utf-8',
	}),
);

async function publish() {
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({
    modules,
    dependencies,
  });
  tx.transferObjects([upgradeCap], tx.pure(ADMIN_ADDRESS));
  const result = await adminSigner.signAndExecuteTransactionBlock({
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

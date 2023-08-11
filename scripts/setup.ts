import { testnetConnection, JsonRpcProvider, RawSigner } from "@mysten/sui.js";
import { getKeyPair } from "./helpers";

import * as dotenv from "dotenv";
dotenv.config();

const adminPrivKey = process.env.ADMIN_PRIVATE_KEY!;
const userPrivKey = process.env.USER_PRIVATE_KEY!;

const adminKeyPair = getKeyPair(adminPrivKey);
const userKeyPair = getKeyPair(userPrivKey);

export const PACKAGE_PATH = process.env.PACKAGE_PATH!;
export const CLI_PATH = process.env.CLI_PATH!;
export const PACKAGE_ID = process.env.PACKAGE_ID!;
export const MINT_CAP_ID = process.env.MINT_CAP_ID!;

export const USER_ADDRESS = userKeyPair.getPublicKey().toSuiAddress();

export const testnetProvider = new JsonRpcProvider(testnetConnection);
export const adminSigner = new RawSigner(adminKeyPair, testnetProvider);
export const userSigner = new RawSigner(userKeyPair, testnetProvider);

export const ADMIN_ADDRESS = adminKeyPair.getPublicKey().toSuiAddress();

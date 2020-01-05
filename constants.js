const fs = require('fs');

const MNEMONIC_ROPSTEN = fs.readFileSync("ropsten.secret").toString().trim();
const MNEMONIC_RSK = fs.readFileSync("rsk.secret").toString().trim();
const RSK_PRIVATE_KEY = fs.readFileSync("rsk_privkey.secret").toString().trim();
const INFURA_KEY = fs.readFileSync("infura.secret").toString().trim();

const ROPSTEN_URL = "https://ropsten.infura.io/v3/" + INFURA_KEY;
const RSK_TESTNET_URL = "https://public-node.testnet.rsk.co:443";
const RSK_MAINNET_URL = "http://public-node.rsk.co:4444";

module.exports = {
    MNEMONIC_ROPSTEN,
    MNEMONIC_RSK, 
    RSK_PRIVATE_KEY, 
    INFURA_KEY,
    ROPSTEN_URL,
    RSK_TESTNET_URL,
    RSK_MAINNET_URL
}
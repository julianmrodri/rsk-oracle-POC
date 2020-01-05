var Oracle = artifacts.require("RIFUSDOracle");
var OraclizeMock = artifacts.require("OraclizeMock");

module.exports = function(deployer, network) {
    if(network=="development"){ //used for running truffle tests
        deployer.deploy(OraclizeMock).then((mockInstance) => {
            let address = mockInstance.address;
            return deployer.deploy(Oracle, address);
        });
    }
    else{
        deployer.deploy(Oracle, "0x0000000000000000000000000000000000000000");
    }
    // Additional contracts can be deployed here
};
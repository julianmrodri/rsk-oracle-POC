const truffleAssert = require('truffle-assertions');
const Oracle = artifacts.require("RIFUSDOracle");
const OraclizeMock = artifacts.require("OraclizeMock");

contract('Oracle', async accounts => {
    let instance;
    let mockInstance;
    let deployAddress;
    const owner = accounts[0];
    const account2 = accounts[1];
    
    beforeEach(async () => {
        instance = await Oracle.deployed();
        mockInstance = await OraclizeMock.deployed();
        deployAddress = instance.address;
    });

    it('should return 0 rif token price in millicents', async () => {
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price, 0);
    });

    it('should have balance 0', async () => {
        let balance = await web3.eth.getBalance(deployAddress);
        assert.equal(balance, 0);
    });

    it('should not start start execution if balance is not enough to cover gas and fee', async () => {
        let balance = await web3.eth.getBalance(deployAddress);
        assert.equal(balance, 0);

        await truffleAssert.reverts(
            instance.startExecution({from: owner}),
            "Provable query was NOT sent, please add some RBTC to cover for the query fee"
        );
    });

    it('should receive deposit', async () => {
        const depositValue = 1000000;
        await web3.eth.sendTransaction({from:accounts[0], to:deployAddress, value:depositValue});
        let balance = await web3.eth.getBalance(deployAddress);
        assert.equal(balance, depositValue);
    });

    it('should not start execution if caller is not owner', async () => {
        await truffleAssert.reverts(
            instance.startExecution({from: account2}),
            "Ownable: caller is not the owner"
        );
    });

    it('should start execution', async () => {
        const expectedQueryId = web3.utils.asciiToHex("00000000000000000000000000000001");
        
        await mockInstance.setExpectedQueryId(expectedQueryId);
        let tx = await instance.startExecution({from: owner});

        truffleAssert.eventEmitted(tx, 'ExecutionStarted');
        truffleAssert.eventEmitted(tx, 'NewProvableQuery');
        truffleAssert.eventEmitted(tx, 'ProvableQueryId', (ev) => {
            return ev.queryId == expectedQueryId;
        });
    });

    it('should not set seconds between executions if caller is not owner', async () => {
        await truffleAssert.reverts(
            instance.setSecondsBetweenExecutions(100, {from: account2}),
            "Ownable: caller is not the owner"
        );
    });

    it('should set seconds between executions', async () => {
        const seconds = 100;
        let tx = await instance.setSecondsBetweenExecutions(seconds, {from: owner});
        truffleAssert.eventEmitted(tx, 'SecondsBetweenExecutionsUpdated', (ev) => {
            return ev.secs == seconds;
        });
    });

    it('should not set gas price if caller is not owner', async () => {
        const gasPrice = 1;
        await truffleAssert.reverts(
            instance.setGasPrice(gasPrice, {from: account2}),
            "Ownable: caller is not the owner"
        );
    });

    it('should set gas price', async () => {
        const gasPrice = 1;
        let tx = await instance.setGasPrice(gasPrice, {from: owner});
        truffleAssert.eventEmitted(tx, 'GasPriceUpdated', (ev) => {
            return ev.price == gasPrice;
        });

        const mockGasPrice = await mockInstance.gasPrice.call();
        assert.equal(mockGasPrice, gasPrice);
    });

    it('should not set callback gas limit if caller is not owner', async () => {
        const gasLimit = 1;
        await truffleAssert.reverts(
            instance.setCallbackGasLimit(gasLimit, {from: account2}),
            "Ownable: caller is not the owner"
        );
    });

    it('should set callback gas limit', async () => {
        const gasLimit = 1;
        let tx = await instance.setCallbackGasLimit(gasLimit, {from: owner});
        truffleAssert.eventEmitted(tx, 'GasLimitUpdated', (ev) => {
            return ev.gasLimit == gasLimit;
        });
    });

    it('should reject call to callback if caller is not cb_address', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "0.1";
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        await truffleAssert.reverts(
            instance.__callback(queryId, result, {from: account2}),
            "Callback can only be called from oraclize callback address"
        );
    });

    it('should accept call to callback from cb_address', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "0.1";
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        let tx = await instance.__callback(queryId, result, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == result;
        });
    });

    it('should update rif token price with 5 digit decimal result', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "0.10502";
        const expectedPrice = Math.floor(Number(result) * Math.pow(10, 5));
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        let tx = await instance.__callback(queryId, result, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == result;
        });
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);
    });

    it('should update rif token price with 10 digit decimal result', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "0.1050290502";
        const expectedPrice = Math.floor(Number(result) * Math.pow(10, 5));
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        let tx = await instance.__callback(queryId, result, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == result;
        });
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);
    });

    it('should update rif token price with 2 digit decimal result', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "0.11";
        const expectedPrice = Math.floor(Number(result) * Math.pow(10, 5));
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        let tx = await instance.__callback(queryId, result, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == result;
        });
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);
    });

    it('should update rif token price with integer result', async () => {
        const queryId = web3.utils.asciiToHex("1");
        const result = "10";
        const expectedPrice = Math.floor(Number(result) * Math.pow(10, 5));
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        let tx = await instance.__callback(queryId, result, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == result;
        });
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);
    });

    it('should start duplicate execution and reject deprecated query id in callback', async () => {
        const firstQueryId = web3.utils.asciiToHex("00000000000000000000000000000001");
        const secondQueryId = web3.utils.asciiToHex("00000000000000000000000000000002");
        await mockInstance.setExpectedQueryId(firstQueryId);

        //Call startExecution for the first time
        let tx = await instance.startExecution({from: owner});

        truffleAssert.eventEmitted(tx, 'ExecutionStarted');
        truffleAssert.eventEmitted(tx, 'NewProvableQuery');
        truffleAssert.eventEmitted(tx, 'ProvableQueryId', (ev) => {
            return ev.queryId == firstQueryId;
        });

        //Call startExecution for the second time, first query id should be deprecated
        await mockInstance.setExpectedQueryId(secondQueryId);
        tx = await instance.startExecution({from: owner});
        truffleAssert.eventEmitted(tx, 'ExecutionStarted');
        truffleAssert.eventEmitted(tx, 'NewProvableQuery');
        truffleAssert.eventEmitted(tx, 'ProvableQueryId', (ev) => {
             return ev.queryId == secondQueryId;
        });

        //Call callback function 
        const resultFirstQuery = "0.1";
        const resultSecondQuery = "0.2";
        const expectedPrice = Math.floor(Number(resultSecondQuery) * Math.pow(10, 5));
        const cbAddress = accounts[2];
        await mockInstance.setCbAddress(cbAddress);
        
        //Call callback function with the latest query id, rif token price should be updated
        tx = await instance.__callback(secondQueryId, resultSecondQuery, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'PriceUpdated', (ev) => {
            return ev.price == resultSecondQuery;
        });
        let price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);

        //Call callback function with the first query id, rif token price should not be updated
        tx = await instance.__callback(firstQueryId, resultFirstQuery, {from: cbAddress});
        truffleAssert.eventEmitted(tx, 'DeprecatedQueryIdReceived', (ev) => {
            return ev.queryId == firstQueryId;
        });

        price = await instance.rifTokenPriceInMillicents.call();
        assert.equal(price.toNumber(), expectedPrice);
    });

    it('should not kill contract if caller is not owner', async () => {
        await truffleAssert.reverts(
            instance.kill(owner, {from: account2}),
            "Ownable: caller is not the owner"
        );
    });

    it('should kill contract and return funds', async () => {
        const depositValue = 1000000;
        await web3.eth.sendTransaction({from:accounts[0], to:deployAddress, value:depositValue});
        let contractBalance = BigInt(await web3.eth.getBalance(deployAddress));
        let ownerBalance = BigInt(await web3.eth.getBalance(owner));

        let tx = await instance.kill(owner);
        const gasUsed = BigInt(tx.receipt.gasUsed);
        const expectedBalance = contractBalance + ownerBalance - gasUsed; //This works with gasPrice set to 1 in truffle-config
        ownerBalance = BigInt(await web3.eth.getBalance(owner));

        assert.equal(ownerBalance, expectedBalance);
        truffleAssert.eventEmitted(tx, 'ContractKilled', (ev) => {
            return ev.payee == owner;
        });
    });
});
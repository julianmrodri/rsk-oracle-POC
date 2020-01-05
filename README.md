# RIF Token Oracle

Oracle that retrieves RIF token price in USD from an external source and stores it on a public variable to be consumed from within other contracts.

Using [provable](http://provable.xyz/) API 0.5 and [Ownable](https://docs.openzeppelin.com/contracts/2.x/api/ownership#Ownable) contract by OpenZeppelin

## Usage
RIF token price stored in public variable `rifTokenPriceInMillicents`. **1 dollar = 10^5 millicents**

To check when the value was last updated, read `lastExecutionTimestamp` public variable

An [example client contract](contracts/OracleClientExample.sol) is included to show how the oracle can be consumed from within another contract. Please note this is just an example, **it is not intended to be used in production environments**.

## Disclaimer and limitations
- RIFUSDOracle queries RIF token price from only one datasource ([CoinGecko API](https://api.coingecko.com/api/v3/simple/price?ids=rif-token&vs_currencies=usd)).
- Users should always check `lastExecutionTimestamp` from the oracle to know how old the price obtained is. 
- The oracle updates rif price every minute, but if for any reason it stopped working then the returned price could be outdated.
- Price obtained from the oracle is in millicents (1 dollar = 10^5 millicents).

**Use at your own risk**


## Contract
https://explorer.testnet.rsk.co/address/0x1fe8b8e0c73fea8802b70d7f6d5c637d59a13ddd
- Gas price: 0.06 gwei by default, can be changed by owner calling `setGasPrice(uint price)`
- Gas limit: 140000 by default, can be changed by owner calling `setCallbackGasLimit(uint gasLimit)`
- Time between executions: 60 seconds by default, can be changed by owner calling `setSecondsBetweenExecutions(uint seconds)`
- In case of unreliable behaviour the Oracle can be terminated by owner calling `kill(address payee)`

**Owner:** [0x1beb4e01bc32279501d5eedf91ad5b2f7fe2f594](https://explorer.testnet.rsk.co/address/0x1beb4e01bc32279501d5eedf91ad5b2f7fe2f594)
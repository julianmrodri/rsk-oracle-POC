/**
**** Disclaimer and limitations ****
*
*   RIFUSDOracle queries rif price from only one datasource (CoinGecko API).
*   Users should always check lastExecutionTimestamp from the oracle to know how old the price obtained is. 
*   The oracle updates rif price every minute, but if for any reason it stopped working then the returned price could be deprecated.
*   Price obtained from the oracle is in millicents (1 dollar = 10^5 millicents).
*
*   Use at your own risk
*
*   This is just an example, it is NOT intended to be used in production environments
*/

pragma solidity ^0.5.0;

import "./IRIFUSDOracle.sol";

contract OracleClientExample {

    IRIFUSDOracle private oracle;
    uint private _oldestTimeAcceptedInSeconds;

    function() external payable {}

    modifier rifPriceIsRecent() {
        uint lastExecutionTimestamp = oracle.lastExecutionTimestamp();
        require(
            now - lastExecutionTimestamp <= _oldestTimeAcceptedInSeconds, 
            "Rif price from oracle is older than acceptable"
        );
        _;
    }

    constructor(address oracleAddress) public {
        oracle = IRIFUSDOracle(oracleAddress);
        _oldestTimeAcceptedInSeconds = 7200; //2 hours
    }

    function calculatePrice(uint rifs) public rifPriceIsRecent returns(uint) {
        uint rifPriceInMillicents = oracle.rifTokenPriceInMillicents();
        return rifPriceInMillicents * rifs;
    }    
}

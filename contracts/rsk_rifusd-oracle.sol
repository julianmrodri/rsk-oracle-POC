pragma solidity ^0.5.0;

import "./IRIFUSDOracle.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./oraclizeAPI_0.5.sol";

contract RIFUSDOracle is IRIFUSDOracle, Ownable, usingOraclize {

    uint256 private _secondsBetweenExecutions;
    uint256 private _callbackGasLimit;
    bytes32 private _currentQueryId;
    bytes32 private _deprecatedQueryId;

    event PriceUpdated(string price);
    event NewProvableQuery(string description);
    event ExecutionStarted(string message);
    event ProvableQueryId(bytes32 queryId);
    event SecondsBetweenExecutionsUpdated(uint256 secs);
    event GasPriceUpdated(uint256 price);
    event GasLimitUpdated(uint256 gasLimit);
    event ContractKilled(address payee);
    event DeprecatedQueryIdReceived(bytes32 queryId);

    constructor(address oarAddress) public payable {
        
        if (address(oarAddress) != address(0) && getCodeSize(address(oarAddress)) > 0) {
            OAR = OraclizeAddrResolverI(oarAddress);
        }
        
        rifTokenPriceInMillicents = 0;
        lastExecutionTimestamp = 0;

        _secondsBetweenExecutions = 60;
        _callbackGasLimit = 140000;

        oraclize_setCustomGasPrice(60000000); //0.06 Gwei
    }

    function() external payable {
        require(msg.data.length == 0); //To prevent retrieving funds from invalid calls
    }

    modifier callbackIsFromProvable() {
        require(
            msg.sender == oraclize_cbAddress(), 
            "Callback can only be called from Provable callback address"
        );
        _;
    }

    modifier oracleHasFunds() {
        require(
            address(this).balance > oraclize_getPrice("URL", _callbackGasLimit), 
            "Provable query was NOT sent, please add some RBTC to cover for the query fee"
        );
        _;
    }

    function kill(address payable _payee) public payable onlyOwner {
        emit ContractKilled(_payee);
        selfdestruct(_payee);
    }

    function __callback(bytes32 myid, string memory result) public callbackIsFromProvable() {
        if(myid == _deprecatedQueryId) {
            emit DeprecatedQueryIdReceived(myid);
            return;
        }
        rifTokenPriceInMillicents = parseInt(result, 5);
        emit PriceUpdated(result);
        
        lastExecutionTimestamp = now;
        _updatePrice();
    }

    function _updatePrice() private oracleHasFunds {
        emit NewProvableQuery("Provable query was sent, standing by for the answer..");
        _currentQueryId = oraclize_query(
            _secondsBetweenExecutions, 
            "URL", 
            "json(https://api.coingecko.com/api/v3/simple/price?ids=rif-token&vs_currencies=usd).rif-token.usd", 
            _callbackGasLimit
        );
        emit ProvableQueryId(_currentQueryId);
    }

    function setSecondsBetweenExecutions(uint256 secs) public onlyOwner {
        _secondsBetweenExecutions = secs;
        emit SecondsBetweenExecutionsUpdated(secs);
    }

    function setGasPrice(uint256 price) public onlyOwner {
        oraclize_setCustomGasPrice(price);
        emit GasPriceUpdated(price);
    }

    function setCallbackGasLimit(uint256 gasLimit) public onlyOwner {
        _callbackGasLimit = gasLimit;
        emit GasLimitUpdated(gasLimit);
    }

    function startExecution() public onlyOwner {
        emit ExecutionStarted("Execution starts. Calling updatePrice()");
        _deprecatedQueryId = _currentQueryId;
        _updatePrice();
    }
}
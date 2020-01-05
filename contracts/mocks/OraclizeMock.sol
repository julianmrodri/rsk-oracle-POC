import "../oraclizeAPI_0.5.sol";

contract OraclizeMock is OraclizeI, OraclizeAddrResolverI {

    address public cbAddress;
    uint256 public gasPrice;
    uint256 private _price;
    bytes32 private _expectedQueryId;

    constructor() public {
        _expectedQueryId = "00000000000000000000000000000001";
    }

    function setProofType(byte _proofType) external{}

    function setCustomGasPrice(uint _customGasPrice) external {
        gasPrice = _customGasPrice;
    }

    function setExpectedQueryId(bytes32 expectedQId) public {
        _expectedQueryId = expectedQId;
    }
    
    function getPrice(string memory _datasource) public returns (uint _dsprice) {
        return 1;
    }

    function getPrice(string memory _datasource, uint _gasLimit) public returns (uint _dsprice) {
        return 1;
    }

    function setCbAddress(address callbackAddress) public {
        cbAddress = callbackAddress;
    }

    function setPrice(uint256 price) public {
        _price = price;
    }

    function randomDS_getSessionPubKeyHash() external view returns (bytes32 _sessionKeyHash) {
        return _expectedQueryId;
    }
    
    function queryN(uint _timestamp, string memory _datasource, bytes memory _argN) public payable returns (bytes32 _id) {
        return _expectedQueryId;
    }
    
    function query(uint _timestamp, string calldata _datasource, string calldata _arg) external payable returns (bytes32 _id) {
        return _expectedQueryId;
    }

    function query2(uint _timestamp, string memory _datasource, string memory _arg1, string memory _arg2) public payable returns (bytes32 _id) {
        return _expectedQueryId;
    }
    
    function query_withGasLimit(uint _timestamp, string calldata _datasource, string calldata _arg, uint _gasLimit) external payable returns (bytes32 _id) {
        return _expectedQueryId;
    }
    
    function queryN_withGasLimit(uint _timestamp, string calldata _datasource, bytes calldata _argN, uint _gasLimit) external payable returns (bytes32 _id) {
        return _expectedQueryId;
    }
    
    function query2_withGasLimit(uint _timestamp, string calldata _datasource, string calldata _arg1, string calldata _arg2, uint _gasLimit) external payable returns (bytes32 _id) {
        return _expectedQueryId;
    }

    function getAddress() public returns (address _address) {
        return address(this);
    }
}
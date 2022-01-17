// https://eips.ethereum.org/EIPS/eip-20
// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "./ITaskToken.sol";

contract TaskToken is IERC20, dAppConfig {
    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    uint256 public totalSupply = 1000000000; //1.000.000.000
    bool private offerAvailable = true;
    address private owner;
    uint256 public tokenOfferCotation;
    uint256 public tokenTradeCotation;

    mapping (uint256 => taskData) public taskOwner; //taskId => struct
    struct taskData {
        bool status;
        bool onStaking;
        address[] colaborators;
        address owner;
        bool deleted;
    }

    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name = "TaskToken";          
    uint8 public decimals = 18;             
    string public symbol = "TSKT";                

    constructor() {
        owner = msg.sender;
        balances[msg.sender] = 300000000;               // Give the creator 30% of all tokens
        balances[address(this)] = totalSupply - balances[msg.sender];
        tokenOfferCotation = 10**12 wei; // 0,000001 ether, ou R$0,02
    }


    //======= TOKEN P2P TRASFERS =======// 
    function transfer(address _to, uint256 _value) public override returns (bool success) {
        require(balances[msg.sender] >= _value, "token balance is lower than the value requested");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }
    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
        uint256 allowanceAmount = allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowanceAmount >= _value, "token balance or allowance is lower than amount requested");
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowanceAmount < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    //======= ACCOUNT & TRADE OPERATIONS =======// 
    function approve(address _spender, uint256 _value) public override returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }
    function allowance(address _owner, address _spender) public override view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    //========= ACCOUNT CHECK ========//
    function balanceOf(address _owner) public override view returns (uint256 balance) {
        return balances[_owner];
    }

    //======= CONTRACT CRYPTO OFFER TOOLS =======// 
    function changeTokenOfferCotation(uint256 _newCotation) public{
        require(msg.sender == owner, "Only the contract owner can call it");
        tokenOfferCotation = _newCotation;
    }
    function changeBuyAvailability() public{
        require(msg.sender == owner, "Only the contract owner can call it");
        offerAvailable = !offerAvailable;
    }

    //======= CONTRACT ORDERS =======// 
    function buyFromContract(uint256 _amount) public payable{
        require(offerAvailable == true, "You can't buy tokens from the contract for now");
        require(msg.value >= _amount*tokenOfferCotation, string(abi.encodePacked("Ether quantity insufficient. Each TaskToken values: ",  uint2str(tokenOfferCotation), " Weis (10^-18 ETH)")));
        uint256 restInContract = balances[address(this)];
        require(restInContract >= _amount, string(abi.encodePacked("Tokens amount unavailable to buy. There is only ", uint2str(restInContract), " tokens")));
        balances[msg.sender] += _amount;
        balances[address(this)] -= _amount;
    }


    function userSignedUp(string memory _username) public{
        emit SignedUpUser(msg.sender, _username);
    }

    function addTaskToStaking(uint256 _taskId) public{
        require(taskOwner[_taskId].owner == msg.sender, "This task doesn't belong you");
        require(balances[msg.sender] >= 1, "You don't have TaskTokens enough to do this operation");
        require(taskOwner[_taskId].onStaking == false, "This task is already in staking");
        balances[msg.sender] -= 1;
        taskOwner[_taskId].onStaking = true;

        emit NewTaskInStaking(_taskId, msg.sender);
    }

    function finishTask(uint256 _taskId) public{
        bool passed = verifyIfIsTaskOwnerOrColaborator(_taskId);
        require(passed, "You're not a colaborator");

        delete taskOwner[_taskId];
        balances[msg.sender] += 1;

        emit TaskDeletedFromStaking(_taskId, msg.sender);
    }

    function taskIsInStaking(uint256 _taskId) public view returns(bool isInStaking){
        return taskOwner[_taskId].onStaking;
    }


    //------------- HELPERS -------------//
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }


    function verifyIfIsTaskOwnerOrColaborator(uint256 _taskId) internal view returns (bool _result){
        address[] memory colaborators = taskOwner[_taskId].colaborators;
        bool passed = false;
        for (uint256 i = 0; i < colaborators.length; i++) {
            if(colaborators[i] == msg.sender){
                passed = true;
            }
        }
        if(msg.sender == taskOwner[_taskId].owner){
            passed = true;
        }
        return passed;
    }
}
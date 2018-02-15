pragma solidity ^0.4.18;

contract Owned {
    address owner;
    
    function Owned() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
}

contract EtherATM is Owned{
    State state;
    
    string public r_user_name;
    address public requester;
    address public giver;
	
	enum State {Active, Locked, Inactive}
	
	modifier inState(State _state ) {
	    require (state == _state);
	    _;
	}
	
	modifier onlyRequester() {
	    require (msg.sender == requester);
	    _;
	}
	
	
	modifier onlyGiver() {
	    require (msg.sender == giver);
	    _;
	}
    /// Create a new contract.
    function EtherATM() public {
		state = State.Active;
    }
    
    function setUserName(string _name) public {
        r_user_name = _name;
    }
    // new request event for giver to receive new request
    event RequestCreated(string r_name, uint r_usd, uint r_wei);
    // accept request event for inform requester if his/her request is accepted by someone or not
	event RequestAccepted (address giver, address requester);
	
	// create new cash request
    function newRequest (string _name, uint _usd, uint _wei) public inState(State.Active){
        state = State.Locked;
        r_user_name = _name;
        requester = msg.sender;
    	RequestCreated( _name, _usd, _wei);
    }
    
    
    function acceptRequest () public inState(State.Locked) {
        state = State.Inactive;
        giver = msg.sender;
        RequestAccepted(msg.sender, requester);
        state = State.Locked;
	}
	
	function confirmReceived () public inState(State.Inactive) onlyRequester {
        state = State.Active;
	}
}


/**
Part 1:
This field includes functions used by both requester.html and giver.html
And define all global variables
**/

// /*Set up web3 provider*/
if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
	// console.log("Metamask detected");
} else {
	// console.log("Metamask not detected");
	web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

/*To test if web3 is connected*/
// if (web3.isConnected()) {
// 	console.log("OK Good");
// } else {
// 	console.log("nothing");
// }

var accounts = web3.eth.accounts;
web3.eth.defaultAccount = web3.eth.accounts[0];


/*Fresh or update the account info*/
function displayAccountInfo() {
	setInterval(function() {
		displayAccount();
		displayBalance();}, 500);
}

/*Display the default account address, which is the first account from the account list*/
function displayAccount() {
	document.getElementById('account').textContent = web3.eth.defaultAccount;
}

/*Display the balance in the default account*/
function displayBalance() {
	var balance;
	web3.eth.getBalance(web3.eth.defaultAccount, web3.eth.defaultBlock, function (error, result) {
		balance = web3.fromWei(result, 'ether').toFixed(6);
		document.getElementById('balance').textContent = balance;
	});
	return balance;
}

var contractABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "state",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getRequester",
		"outputs": [
			{
				"name": "",
				"type": "string"
			},
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "g_account",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "g_accepted_at",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "requested_by",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "r_eth_amount",
				"type": "uint256"
			}
		],
		"name": "RequestAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "r_name",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "r_by",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "r_usd",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "r_eth",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "r_created_at",
				"type": "uint256"
			}
		],
		"name": "RequestCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "r_name",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "r_account",
				"type": "address"
			}
		],
		"name": "RequesterInfo",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "r_account",
				"type": "address"
			},
			{
				"name": "accepted_at",
				"type": "uint256"
			},
			{
				"name": "r_eth_amount",
				"type": "uint256"
			}
		],
		"name": "acceptRequest",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_usd",
				"type": "uint256"
			},
			{
				"name": "_eth",
				"type": "uint256"
			},
			{
				"name": "_created_at",
				"type": "uint256"
			}
		],
		"name": "newRequest",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_name",
				"type": "string"
			}
		],
		"name": "newRequester",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
];
var EtherATMContract = web3.eth.contract(contractABI);
var contractAddress = '0x63ed4d94622b10186d9d3f0686be208b7456e109';
var EtherATMInstance = EtherATMContract.at(contractAddress);


// /**
// Part 2:
// All functions and variables used only for requester are defined in this part
// **/

/* Watching the requester even */
var requesterEvent = EtherATMInstance.RequesterInfo();
requesterEvent.watch(function(error, result){
    if (!error) {
    	$("#req_info").html(result.args.r_name + ' (' + result.args.r_account);
    } else {
    	console.log(error);
    }
});

/* Requester sends out a request */
function createRequester() {
	var userName = document.getElementById('user').value;
	EtherATMInstance.newRequester(userName, function(error, result){
	// EtherATMInstance.newRequester($("#user").val(), function(error, result){
		if(!error) {
			console.log(error);
		} else {
			console.log(result);
		}
	});
}

var createRequestEvent = EtherATMInstance.RequestCreated();
createRequestEvent.watch(function(error, result){
    if (!error) {
    	$("#reqs").html('Successfully: ' + '(' + result.args.r_name + ' requests $' + result.args.r_usd + ' )');
    } else {
    	console.log(error);
    }
});

// string _name, uint _usd, uint _eth, uint _created_at
function createRequest() {
	var userName = document.getElementById('user').value;
	var usd_in = document.getElementById('usd').value;
	var eth_in = document.getElementById('eth').value;
	var wei_in = web3.toWei(eth_in, 'ether');
	// console.log(eth_in);
	var time_stamp = Math.floor(Date.now() / 1000);
	if (true) {
		EtherATMInstance.newRequest(userName, usd_in, wei_in, time_stamp, function(error, result){
			if(!error) {
				console.log(error);
				$("#reqs").html('Successfully, your request is send out');
			} else {
				console.log(result);
			}
		});
	} else {
		// aMsg.innerHTML= '<span style="color:red">请输入5--10个字符！</span>';
	}
}

/* Create options to filter out the accepted accepts which are send from a specific user(address)*/
var requestAcceptedEvent = EtherATMInstance.RequestAccepted();
// var acceptedRequestOptions = {
// 	'fromBlock': 0,
// 	'toBlock': 'latest',
// 	'address': contractAddress,
// 	'topics':[]
// };
// var acceptedRequestFilter = web3.eth.filter(acceptedRequestOptions);
// acceptedRequestFilter.get(function(error, result) {
// 	if(!error) {

// 	} else {
// 		console.log("error");
// 	}
// });

/*Using API to obtain real-time exchange rate*/
function getExchangeRate() {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=ETH", false);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send();
	var response = xhttp.responseText;
	var rate = response.slice(7, -1);
	return rate;
}

/* Converter: from usd to ether with real-time exchange rate */
function usdToEtherConverter() {
	var ether_value;
	var rate = getExchangeRate();
	ether_value = document.getElementById('usd').value * rate;
	document.getElementById('eth').value = ether_value.toFixed(8);
}

/* Make verification: if the ether balance is enough to pay for the amount of dollars entered by user*/
function verifyEtherAmount() {
	// var balance = web3.toWei(displayBalance(), 'ether');
	// var ethAmount = document.getElementById('eth');
	// var weiAmount = web3.toWei(ethAmount, 'ether');
	// if (balance < weiAmount) {
	// 	return false;
	// } else {
	// 	return true;
	// }
}

/* Requester pay ether to giver */
function sendPayment() {
	var accounts = web3.eth.accounts;
	var to_address = document.getElementById('pay_to').value;
	var val_eth = document.getElementById('eth').value;
	var val_wei = web3.toWei(val_eth, 'ether');

	web3.eth.sendTransaction({
		from: accounts[0],
		to: to_address,
		value: val_wei
	}, function (error, result) {
		if (!error) {
			document.getElementById('response').innerHTML = 'Success: <a href="https://testnet.etherscan.io/tx/' + result + '"> View Transaction </a>';
		} else {
			document.getElementById('response').innerHTML = '<pre>' + error + '</pre>';
		}
	});
	document.getElementById('pay_to').reset();
}


/**
Part 3:
All functions and variables used only for giver are defined in this part
**/

var requestCreatedEvent = EtherATMInstance.RequestAccepted();
var allRequestsOptions = {
	'fromBlock': 0,
	'toBlock': 'latest',
	'address': contractAddress,
	'topics':[]
};
var allRequestFilter = web3.eth.filter(allRequestsOptions);
requestCreatedEvent.get(function(error, result) {
	if(!error) {

	} else {
		console.log("error");
	}
});
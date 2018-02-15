
/**
Part 1:
Functions and global variables used by both requester.html and giver.html
**/

/*Set up web3 provider*/
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

// var accounts = web3.eth.accounts;
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
		"name": "requester",
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
		"name": "r_user_name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "giver",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "giver",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "requester",
				"type": "address"
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
				"name": "r_usd",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "r_wei",
				"type": "uint256"
			}
		],
		"name": "RequestCreated",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "acceptRequest",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "confirmReceived",
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
				"name": "_wei",
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
		"name": "setUserName",
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
var contractAddress = '0x1e747df75ee456625e9d5670abe0f1cad91cbec1';
var EtherATMInstance = EtherATMContract.at(contractAddress);

/**
Part 2:
All functions and variables used only for requester.html
**/

/* Watching the requester event */
// var requesterEvent = EtherATMInstance.RequesterInfo();
// requesterEvent.watch(function(error, result){
//     if (!error) {
//     	$("#req_info").html(result.args.r_name + ' (' + result.args.r_account);
//     } else {
//     	console.log(error);
//     }
// });

// function createRequester() {
// 	var userName = document.getElementById('user').value;
// 	EtherATMInstance.newRequester(userName, function(error, result){
// 	// EtherATMInstance.newRequester($("#user").val(), function(error, result){
// 		if(!error) {
// 			console.log(error);
// 		} else {
// 			console.log(result);
// 		}
// 	});
// }


function createRequest() {
	var userName = document.getElementById('user').value;
	var usd_in = document.getElementById('usd').value;
	var eth_in = document.getElementById('eth').value;
	var wei_in = web3.toWei(eth_in, 'ether');
	// console.log(eth_in);
	// var time_stamp = Math.floor(Date.now() / 1000);

	EtherATMInstance.newRequest(userName, usd_in, wei_in, function(error, result){
		if(!error) {
			console.log(error);
			$("#reqs").html('Your request is successfully send out!');
		} else {
			console.log(result);
		}
	});

	document.getElementById("user").value = "";
    document.getElementById("usd").value = "";
    document.getElementById("eth").value = "";
}

/* Requester is always waiting for notification of who acceptes the cash request */
var requestAcceptedEvent = EtherATMInstance.RequestAccepted();
requestAcceptedEvent.watch(function(error, result){
    if (!error) {
    	if (result.args.requester == web3.eth.defaultAccount) {
    		$("#accepter_info").html('Your request is accepted by ' + result.args.giver);	
    	}
    } else {
    	console.log(error);
    }
});

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

/* Converter: from usd to ether with exchange rate */
function usdToEtherConverter() {
	var ether_value;
	var rate = getExchangeRate();
	ether_value = document.getElementById('usd').value * rate;
	document.getElementById('eth').value = ether_value.toFixed(8);
}

/**TO DO**/
/* Make verification: wheather the ether balance is enough to pay for the amount of dollars entered by user or not*/
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

/* Requester confirms and pay ether to giver */
function sendPayment() {
	// EtherATMInstance.confirmReceived();
	var accounts = web3.eth.accounts;
	var to_address = document.getElementById('pay_to').value;
	var val_eth = document.getElementById('eth_amount').value;
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

/* Cash giver is always wait for new request from requester */
var requestCreatedEvent = EtherATMInstance.RequestCreated();
requestCreatedEvent.watch(function(error, result){
    if (!error) {
    	var eth = web3.fromWei(result.args.r_wei, 'ether');
    	$("#new_req_info").html(result.args.r_name + ' requests $' + result.args.r_usd + ' with ' + eth + 'ethers!');
    } else {
    	console.log(error);
    }
});

function acceptRequest() {	
	EtherATMInstance.acceptRequest(function(error, result){
		if(!error) {
			$("#win_msg").html('You are the winner!');
		} else {
			console.log(error);
		}
	});
}

// function startWatchEvent() {

// }

// function stopWatchEvent() {
	
// }
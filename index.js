const cron = require("node-cron");
const express = require("express");
const fs = require("fs");

var HDWalletProvider = require("truffle-hdwallet-provider");
var Web3 = require('web3');

var auctionsBoxInstance = require('./auctionBoxInstance');

app = express();



const mnemonic = "doll miss roast antenna open oxygen chuckle stairs bean gravity erode series";
const provider = new HDWalletProvider(mnemonic, "http://localhost:7545");
const web3 = new Web3(provider);
const myContract = new web3.eth.Contract(auctionsBoxInstance.abi, auctionsBoxInstance.address);

const accountPaymentAddress = "0xEcd1604D402BCA4daadCd3A65968BD42191d9f9e";
const accountPaymentPrivateKey = "acb6b8b741cfcfe2be08e2c9369eb1ba44ec13788179b8fa99b7f979aef721ee";


//   const signPromise = web3.eth.signTransaction(tx, tx.from);

//   signPromise.then((signedTx) => {
//     // raw transaction string may be available in .raw or 
//     // .rawTransaction depending on which signTransaction
//     // function was called
//     const sentTx = web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//     sentTx.on("receipt", receipt => {
//       // do something when receipt comes back
//       process.stdout.write("receipt: " + receipt);
//     });
//     sentTx.on("error", err => {
//       // do something on transaction error
//       process.stdout.write("err: " + err);
//     });
//   }).catch((err) => {
//     // do something when promise fails
//     process.stdout.write("catch err: " + err);
//   });



cron.schedule("* * * * *", function () {
    console.log("running a task every minute");
    myContract.methods
        .isHasAuctionOverTime(new Date().getTime())
        .call()
        .then((isHasAuctionOverTime) => {
            console.log(isHasAuctionOverTime);
            if (isHasAuctionOverTime == true) {

                const tx = {
                    // this could be provider.addresses[0] if it exists
                    from: accountPaymentAddress,
                    // target address, this could be a smart contract address
                    to: auctionsBoxInstance.address,
                    // optional if you want to specify the gas limit 
                    gas: 6721975,
                    // optional if you are invoking say a payable function 
                    // value: 20000000000000000000,
                    // this encodes the ABI of the method and the arguements
                    data: myContract.methods.finalizeWhenOverTime(new Date().getTime()).encodeABI(),
                    chainId: web3.eth.getChainId()
                };


                web3.eth.accounts.signTransaction(tx, accountPaymentPrivateKey).then((hash) => {
                    web3.eth.sendSignedTransaction(hash.rawTransaction).then((receipt) => {
                        console.log(receipt);
                    }, (error) => {
                        console.log(error);
                        reject(500);
                    });
                }, (error) => {
                    // reject(500);
                    console.log(error);
                });


            }
        });
});

app.listen(3128);
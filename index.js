import cron from 'node-cron'
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs'
let rawdata = fs.readFileSync(__dirname + '/abi.json');
let abi = JSON.parse(rawdata);

import dotenv from 'dotenv'
dotenv.config()

import Web3 from 'web3'

const PRIVATE_KEY = process.env.FTM_ACC_1
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const provider = new Web3.providers.HttpProvider(
  'https://rpc.ftm.tools'
)

var args = process.argv.slice(2)

const web3 = await new Web3(provider)
web3.eth.accounts.wallet.add(PRIVATE_KEY)

const account = web3.eth.accounts.wallet[0].address

const contract = new web3.eth.Contract(abi, '0x69e7D335E8Da617E692d7379e03FEf74ef295899')

console.log('Starting Bot...')
console.log(`Will buy miners every ${args.length==1?args[0]:'30'} minutes`)
const executor = async () =>{const estimatedGas = await contract.methods.hatchEggs(WALLET_ADDRESS)
        .estimateGas(
          {
            from: WALLET_ADDRESS,
            gasPrice: web3.utils.toWei('500', 'gwei')
          })
      let result = await contract.methods.hatchEggs(WALLET_ADDRESS).send({ from: account, gasPrice: web3.utils.toWei('250', 'gwei') , gas: estimatedGas });
      const block = await web3.eth.getBlock(result.blockNumber)

      var d = new Date(0) // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(block.timestamp)

      console.log(`Successful - ${d.toLocaleString()} - More Miners hired on block ${result.blockNumber}.`)
  }
  cron.schedule(`*${args.length==1?'/'+args[0]:'/30'} * * * *`, executor)
  executor()
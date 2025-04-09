const axios = require('axios');
const crypto = require('crypto');

const MAINNET = 'https://voynich-mainnet.azurewebsites.net/api/traversal'


const REQUIRED = [
    'derivative', 'action', 'face', 'maturity', 
    'collateral', 'interest', 'fixed',
    'late', 'fee', 'due', 'cap', 'asset', 'uid', 'hash'
]

const NUMERICS = [
    'face', 'maturity', 'interest', 
     'late', 'fee', 'cap'
]

const TRANSACTT = ['mint', 'settle']

let support = null





async function enlighten(pkg) {
    let rtrn = {'status':false, 'log':'Failed to communicate with voynich mainnet'}

    
   
    try {
        const response = await axios.post(MAINNET, pkg.body, {
            headers: {
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip, deflate" 
            }
        });

      
        rtrn = response.data
    } catch (error) {
        console.error("Voynich Main Network Communication Error:", error.response ? error.response.data : error.message);
    }

    return rtrn
}




function signature(value, salt, iterations = 1000, keyLength = 64, algo = 'sha512') {
    return crypto.pbkdf2Sync(value, salt, iterations, keyLength, algo).toString('hex');
}




function formatted(transaction){
    const proc = REQUIRED.every(key => 
        transaction.hasOwnProperty(key) && 
        transaction[key] !== null && 
        transaction[key] !== undefined
    );
    const numrl = NUMERICS.every(key => 
        typeof transaction[key] === 'number' &&
        transaction[key] >= 0 
    );

    const truthy = ('fixed' in transaction && typeof transaction.fixed === 'boolean')
    const isoey = ('due' in transaction && !isNaN(Date.parse(transaction.due)));

    const proper = TRANSACTT.includes(transaction.action)
    const exc = ((proc === true && numrl === true) && (truthy === true && isoey === true ))

    const rtrn = (proper === true && exc === true)

    return rtrn
}





async function adopt(address, enigma, email){
    const action = 'adopt'
    const adoption = await enlighten({'body':{action, address, enigma, email}})

    return adoption
}




async function validate(address){
    const action = 'validate'
    const taken = await enlighten({'body':{address, action}})

    return taken
}




async function holdings(address){
    const action = 'holdings'
    const wallet = await enlighten({'body':{address, action}})

   

    return wallet
}





async function supported(){
    if(support == null){
        const action = 'supported'
        const latest = await enlighten({'body':{action}})

        support = latest
    }

    return support
}






async function power(asset, address=null, hash=null){
    const action = 'power'

    let payload = {action, asset}

    if(address !== null && hash != null){
        payload = {action, asset, address, hash}
    }

    const result = await enlighten({'body':payload})



    return result
}






async function transactionHash(hash){
    const action = 'hash'
    const details = await enlighten({'body':{action, hash}})


    return details
}





function consensus(contract, wallet){
    const sigil = signature(wallet.key, wallet.pen)
    const consent = signature(contract, sigil)

    const address = wallet.address
  
    return {address, consent}
}






function sign(contract, wallet, sibyl){
    const memberConsensus = consensus(contract, wallet)
    const brokerConsensus = consensus(contract, sibyl)

    const memberConsent = memberConsensus.consent
    const memberAddress = memberConsensus.address

    const brokerAddress = brokerConsensus.address
    const brokerConsent = brokerConsensus.consent

    return {memberAddress, memberConsent, brokerAddress, brokerConsent}
}






async function transact(transaction, wallet, sibyl){
    let rtrn = {'status':false, 'log':'Invalid Transaction'}

    const exec = formatted(transaction)

    if(exec === true){
        const contract = JSON.stringify(transaction);
        const consent = sign(contract, wallet, sibyl)

      
        rtrn = await enlighten({'body':{transaction, consent}})
    }
   

    return rtrn
}






async function report(wallet, month, year, sibyl) {
    let rtrn = { 'status': false, 'log': 'Invalid Request' };

    const validYear = (typeof year === "number" && (year >= 1000 && year <= 9999))
    const validMonth = (typeof month === "number" && (month >= 1 && month <= 12))

    if (validYear && validMonth) {
        const period = {month, year}
        const contract = JSON.stringify(period)
        const consent = sign(contract, wallet, sibyl)
        const action =  'close'
        rtrn = await enlighten({'body':{action, period, consent}})

    }

    return rtrn
}





async function liability(address, month, year, sibyl){
    let rtrn = { 'status': false, 'log': 'Invalid Request' };

    const validYear = (typeof year === "number" && (year >= 1000 && year <= 9999))
    const validMonth = (typeof month === "number" && (month >= 1 && month <= 12))


    if(validYear && validMonth){
        const period = {month, year}
        const contract = JSON.stringify(period)
        const brokerConsensus = consensus(contract, sibyl)
        const brokerAddress = brokerConsensus.address
        const brokerConsent = brokerConsensus.consent

        const consent = {brokerAddress, brokerConsent}
        const action =  'close'

        rtrn = await enlighten({'body':{action, address, period, consent}})
    }
  

    return rtrn
}









async function compliant(wallet, sibyl){
    let rtrn = { 'status': false, 'log': 'Invalid Request' };

    const contract = `${wallet.address}${sibyl.address}`
    const consent = sign(contract, wallet, sibyl)
    const action =  'kyc'

    rtrn = await enlighten({'body':{action, consent}})


    return rtrn
}





module.exports = {
    adopt,
    validate,
    holdings,
    supported,
    power,
    transactionHash,
    transact,
    report,
    liability,
    compliant
}
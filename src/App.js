import './App.css';
import React, {  useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col ,Row} from 'react-bootstrap';

import Cup from './images/cup.png';
import Title from './images/title.png';
import kp from './keypair.json';
import admin_kp from './Adminkeypair.json';

import idl from './idl.json';
import adminWallet from './env.json';
import { Connection,  clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;

// Create a keypair for the account that will hold the betting data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);

const admin_arr = Object.values(admin_kp._keypair.secretKey);
const admin_secret = new Uint8Array(admin_arr);
const adminAccount = web3.Keypair.fromSecretKey(admin_secret);


window.Buffer = window.Buffer || require('buffer').Buffer;

// Get our program's id from the IDL file.
const programID = new PublicKey("DWJoeHYV3uGGmWbEBmgzmiZbBrjbVNPBcMBYprehjyWo");

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

function App() {

  const [walletAddress, setWalletAddress] = useState(null); // address of user
  const [poolWalletAddress, setPoolWalletAddress] = useState(null);  //address of poolWallet
  const [stake_bal, setSelectedStakeBalance] = useState(null); // sol amount that the user bets
  const [balance, getWalletBalance] = useState(null); // total sol amount of user's wallet
  const [pool_bal,getPoolWalletBalance] = useState(null); // total sol amount of poolWallet
  const [pred, setPrediction] = useState(null); // predection that user bets
  const [claimFunds, setClaimFunds] = useState(1);//set the amount of claim and deposit
  const [adminWalletAddress, setAdminWallet] = useState(null);
  //check if the phantom wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
  
      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect();
          setWalletAddress(response.publicKey.toString());
          setPoolWalletAddress(adminAccount.publicKey.toString());
          setAdminWallet(adminWallet.ADMIN_WALLET_ADDRESS);
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (walletAddress && solana) {
      await (solana).disconnect();
      setWalletAddress(null);
    }
  };

  const connectWallet = async () => {
    // console.log(adminAccount.publicKey.toString());
    // console.log(baseAccount.publicKey.toString());
    await checkIfWalletIsConnected();
    await getBalance();
    // const provider = getProvider();
    // const program = new Program(idl, programID, provider);
    
    // await program.rpc.startStuffOff({
    //   accounts: {
    //     baseAccount: baseAccount.publicKey,
    //     user: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [baseAccount],
    // });
    //get the balance of user's wallet
  };

  const getBalance = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const publicKey = provider.wallet.publicKey;
    const balanceOfwallet = await connection.getBalance(publicKey);
    getWalletBalance(balanceOfwallet / LAMPORTS_PER_SOL);
    const balanceOfadminwallet = await connection.getBalance(adminAccount.publicKey);
    getPoolWalletBalance(balanceOfadminwallet/ LAMPORTS_PER_SOL);
  }


  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment,);
    return provider;
  }

  const placeBet = async () => {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);


    if(pred==null || stake_bal == null ){
      alert("please select the image and stake_balance both :)");
      return
    }
    
    //setting the betting value
    let placeBet = await program.rpc.placeBet(pred,(stake_bal * LAMPORTS_PER_SOL).toString(), {
        accounts: {
            baseAccount:baseAccount.publicKey,
            from: provider.wallet.publicKey,
            to: adminAccount.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });
    setPrediction(null);
    setSelectedStakeBalance(null);
    await getBalance();
    console.log("place bet->",placeBet);
    

    const min = 0;
    const max = 2;
    let rand = Math.floor(Math.random() * (max - min)) + min;

    // generating the random number and sending to the program
    let compareBet = await program.rpc.compareBet(rand, {
        accounts: {
          baseAccount:baseAccount.publicKey,
        },
    });
    console.log("compare bet->",compareBet);

    let resultBet = await program.rpc.resultBet({
    accounts: {
        baseAccount:baseAccount.publicKey,
        from: adminAccount.publicKey,
        to: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
    },
    signers:  [adminAccount],
    });

    await getBalance();
    console.log("result bet->",resultBet);
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);  
    console.log("bet vec->", account.currentBet.boolWinner);
    if (account.currentBet.boolWinner===true){
      alert("Win");
    } else {
      alert("fail");
    }
    setPrediction(null);

  }

  const renderNotConnectedContainer = () => (
    <div className='right-buttons'>
      <div className="vl"></div>
      <button className="connect" onClick={connectWallet}>Connect</button>
    </div>
  );
  
  const renderConnectedContainer =  () => {
    const provider = getProvider();
    if (adminWalletAddress === provider.wallet.publicKey.toString()){
      return (
        <div className='right-buttons'>
          <div className="vl"></div>
          <input type="text" className="connect amount" value = {claimFunds} onChange = {(e) => setClaimFunds(e.target.value)}/>
          <button className="connect deposit"  onClick={() => depositfund()}>Deposit</button>
          <button className="connect claim"  onClick={() => claimfund()} >Claim</button>
          <button className="connect" onClick={() => disconnectWallet()} >Disconnect</button>
        </div>
      );
    } else {
      return(
        <div className='right-buttons'>
          <div className="vl"></div>
          <button className="connect" onClick={() => disconnectWallet()}>Disconnect</button>
        </div>
      );
    }
  }

  const renderwallet = () => {
    const provider = getProvider();
    console.log(provider.wallet.publicKey.toString());
    if ( provider.wallet.publicKey.toString() === adminWalletAddress){
      return (
        <div className='wallet'>
          <Row>
            <Col md={3}>
              <h3>Wallet: {walletAddress}</h3>
              <h3>Balance: {balance}SOL</h3>
            </Col>
            <Col md={6}/>
            <Col md={3}>
              <h3>Platform: {poolWalletAddress}</h3>
              <h3>Balance: {pool_bal}SOL</h3>
            </Col>
          </Row>
        </div>
      );
    } else{
        return(
          <div className='wallet'>
            <h3>Wallet: {walletAddress}</h3>
            <h3>Balance: {balance}SOL</h3>
          </div>
        );
    }

    
  }


  const depositfund = async () => {
    //Todo withdrawfund
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.claimDepositFund((claimFunds * LAMPORTS_PER_SOL).toString(),{
      accounts: {
          baseAccount:baseAccount.publicKey,
          from: provider.wallet.publicKey,
          to: adminAccount.publicKey,
          systemProgram: SystemProgram.programId,
      },
    });
    setClaimFunds(0);
    getBalance();
    alert("success");
  }

  const claimfund = async () => {
    //Todo withdrawfund
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    await program.rpc.claimDepositFund((claimFunds * LAMPORTS_PER_SOL).toString(),{
      accounts: {
          baseAccount:baseAccount.publicKey,
          from: adminAccount.publicKey,
          to: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
      },
      signers: [adminAccount],
    });
    setClaimFunds(0); 
    getBalance();
    alert("success");
  }


  const imageClick = (pred) => {
    setPrediction(pred);
  }

  return (
    <div style={{ backgroundImage: "url(/background.png)" }}>
      <div className="nav">
        <span>Degen Coin Finder</span>
        {!walletAddress && renderNotConnectedContainer()}
        {walletAddress && renderConnectedContainer()}
      </div>
      <div className="lower-content">
        {walletAddress && renderwallet()}
        <div className="game">
          <h1 className="title">
            <Row>
              <Col md={12}>
                <img
                  id="title"
                  src={Title}
                  alt="title"
                />
              </Col>
            </Row>
          </h1>
          <div className="content">
            <div className="content-top">
              <Row>
                <Col md={4}>
                  {pred === 0 ? (
                    <img
                      className="active"
                      id="left"
                      src={Cup}
                      alt="left"
                      height="200"
                      onClick={() => imageClick(0)}
                    />
                  ) : (
                    <img
                      src={Cup}
                      id="left"
                      alt="left"
                      height="200"
                      onClick={() => imageClick(0)}
                    />
                  )}
                </Col>
                <Col md={4}>
                {pred === 1 ? (
                    <img
                      className="active"
                      id="center"
                      src={Cup}
                      alt="center"
                      height="200"
                      onClick={() => imageClick(1)}
                    />
                  ) : (
                    <img
                      src={Cup}
                      id="center"
                      alt="center"
                      height="200"
                      onClick={() => imageClick(1)}
                    />
                  )}
                </Col>
                <Col md={4}>
                  {pred === 2 ? (
                    <img
                      className="active"
                      id="right"
                      src={Cup}
                      alt="Right"
                      height="200"
                      onClick={() => imageClick(2)}
                    />
                  ) : (
                    <img
                      src={Cup}
                      id="right"
                      alt="Right"
                      height="200"
                      onClick={() => imageClick(2)}
                    />
                  )}
                </Col>
              </Row>
            </div>
            <div className="content-bottom">
              <Row>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(0.05)}
                  >
                    0.05 SOL
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(0.1)}
                  >
                    0.10 SOL
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(0.25)}
                  >
                    0.25 SOL
                  </Button>
                </Col>
              </Row>
              <br></br>
              <Row>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(0.5)}
                  >
                    0.50 SOL
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(1)}
                  >
                    1.00SOL
                  </Button>
                </Col>
                <Col md={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => setSelectedStakeBalance(2)}
                  >
                    2.00SOL
                  </Button>
                </Col>
              </Row>
              <hr />
              <Button variant="outline-info" onClick={() => placeBet()}>
                Find the Coin!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
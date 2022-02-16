#!/bin/sh

echo
echo "***************************************************************************************************"
echo "                                  🚀 Deploy to devnet!"
echo "***************************************************************************************************"
echo

if ! command -v rustup &> /dev/null
then
    echo "Rust is not installed! Execute: ./install.sh "
    exit 1
fi

if ! command -v solana &> /dev/null
then
    echo "Solnana is not installed! Execute: ./install.sh "
    exit 1
fi

if ! command -v anchor &> /dev/null
then
    echo "anchor is not installed! Execute: ./install.sh "
    exit 1
fi

 echo "First, switch to devnet..."

 solana config set --url devnet
 
 solana config get

 echo "Airdroping 10 SOL on the devnet"

 solana airdrop 10

echo "Checking balance"

solana balance

echo "Changing up some variables..."

sed -i '' 's/localnet/devnet/' myepicproject/Anchor.toml

echo "Building..."

cd myepicproject

anchor build

PROGRAM_ID=$(solana address -k target/deploy/myepicproject-keypair.json)

echo "PROGRAM ID : $PROGRAM_ID"

sed -i '' "s/declare_id!.*/declare_id!(\"$PROGRAM_ID\");/" programs/myepicproject/src/lib.rs        

sed -i '' "s/myepicproject =.*/myepicproject = \"$PROGRAM_ID\"/" Anchor.toml

cd ../src 

node copyIdl.js

sed -i '' "s/PublicKey(.*)/PublicKey(\"$PROGRAM_ID\")/" App.js

node createAdminWalletkeypair.js
node createKeyPair.js

cd ../myepicproject 

#check wallet path 

anchor build

anchor deploy

cd ..

npm run start

echo
echo "***************************************************************************************************"
echo "*                                 DONE!*"
echo "***************************************************************************************************"
echo

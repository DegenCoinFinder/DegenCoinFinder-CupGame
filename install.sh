#!/bin/sh
echo "Installing Rust"

which rustup || curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env

echo "Installing Solana"

which solana || sh -c "$(curl -sSfL https://release.solana.com/v1.9.4/install)"
SOLANA_HOME=$(which solana | sed 's/\/solana//g')
export PATH="$SOLANA_HOME:$PATH"

echo "Install Mocha"

node --version || "NODE NOT FINDED, PLEASE INSTALL NODEJS 14LTS and rerun this script - https://nodejs.org/en/download/"
npm --version && (npm list -g mocha || npm install -g mocha)

echo "Install Anchor"

which anchor || cargo install --git https://github.com/project-serum/anchor anchor-cli --locked

echo 

solana config get

echo
echo "*********************************************************************************************"
echo "* Now you need to follow the instructions in the README.md to config your wallet and deploy *"
echo "*********************************************************************************************"
echo

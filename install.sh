#!/bin/sh

echo
echo "***************************************************************************************************"
echo "                                  Checking all dependencies..."
echo "***************************************************************************************************"
echo

if ! command -v rustup &> /dev/null
then
    echo "Installing Rust"
    curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
    source $HOME/.cargo/env
else
    echo "Rust is already installed"
fi

if ! command -v solana &> /dev/null
then
    echo "Installing Solana"

    sh -c "$(curl -sSfL https://release.solana.com/v1.9.4/install)"

    PROFILE=$HOME/.profile
    if test -f "$PROFILE"; then
        which solana || echo "export PATH=\"$HOME/.local/share/solana/install/active_release/bin:$PATH\"" >> $HOME/.profile && source ~/.profile
    fi

    BASH_PROFILE=$HOME/.bash_profile
    if test -f "$BASH_PROFILE"; then
        which solana || echo "export PATH=\"$HOME/.local/share/solana/install/active_release/bin:$PATH\"" >> $HOME/.bash_profile && source ~/.bash_profile
    fi

    solana config get || echo ">>>> FAIL to put solana bin in path, please execute it manually: export PATH=\"$HOME/.local/share/solana/install/active_release/bin:$PATH\""

else
    echo "Solana is already installed"
fi

if ! command -v anchor &> /dev/null
then
    echo "Installing Anchor"
    cargo install --git https://github.com/project-serum/anchor anchor-cli --locked
else
    echo "Anchor is already installed"
fi

echo "Installing Mocha"

which node &> /dev/null || echo ">>>> NODEJS NOT FOUND, PLEASE INSTALL NODEJS 14LTS or 16LTS and rerun this script - https://nodejs.org/en/download/"
which npm &> /dev/null && (npm list -g mocha || npm install -g mocha) || echo ">>>> NPM NOT FOUND, PLEASE INSTALL NPM and rerun this script - https://nodejs.org/en/download/"

echo
echo "***************************************************************************************************"
echo "* DONE! Now you need to follow the instructions in the README.md to config your wallet and deploy *"
echo "***************************************************************************************************"
echo

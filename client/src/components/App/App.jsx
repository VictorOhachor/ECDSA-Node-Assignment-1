import Wallet from "../Wallet";
import Transfer from "../Transfer";
import "./App.scss";
import { useEffect, useState } from "react";
import { formatEther, getAddress, hexlify } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding'
import server from "../../server";

function App() {
    const [balance, setBalance] = useState();
    const [address, setAddress] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    const onboarding = new MetaMaskOnboarding({
        forwarderOrigin: 'https://localhost:3042',
    });

    const getBalance = async (account) => {
        let accBal = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
        });
        accBal = formatEther(accBal);

        // set the account balance
        setBalance(accBal);

        // sync with the server
        await registerAddress(account, accBal);
    }

    const registerAddress = async (address, balance) => {
        console.log(address, balance);
        const result = await server.post('/register', { address, balance }, {
            'Content-Type': 'application/json', withCredentials: true
        });
        console.log(result);
        console.log(document.cookie);
    }

    const handleLogin = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                // request account access if needed
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                if (accounts.length > 0) {
                    const accAddress = hexlify(getAddress(accounts[0]));
                    setAddress(accAddress);

                    // Get account balance
                    await getBalance(accAddress);

                    setLoggedIn(true);
                }
            } catch (err) {
                console.error(err.message);
            }

        } else {
            console.error('Please install the Metamask extension');
            onboarding.startOnboarding();
        }
    }

    return (
        <div className="app">
            <Wallet
                balance={balance}
                address={address}
                handleLogin={handleLogin}
                loggedIn={loggedIn}
            />
            <Transfer balance={balance} setBalance={setBalance} address={address} />
        </div>
    );
}

export default App;

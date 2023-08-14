import server from "../server";

function Wallet({ address, balance, handleLogin, loggedIn }) {
    return (
        <div className="container wallet">
            <h1>Your Wallet</h1>
            
            {loggedIn ? (
                <label>
                    Wallet Address
                    <input placeholder="Type in your wallet address, for example: bfb74c646fe65ff7a..." value={address} disabled></input>
                </label>
            ) : (
                <input type="button" className="button" value="Connect to MetaMask" onClick={handleLogin} />
            )}

            <div className="balance">Balance: {balance}</div>
        </div>
    );
}

export default Wallet;

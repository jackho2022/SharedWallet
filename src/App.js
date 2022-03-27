import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWallet.json";

function App() {
  const accounts = [];
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
/**
  const transactions = [
    {id:0, content:"0.0001 ETH to Receiver 123444"},
    {id:2, content:"0.0005 ETH to Receiver 141423"}
  ]; **/
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOwner, setIsWalletOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", walletName: "" });
  const [walletOwnerAddress, setWalletOwnerAddress] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);
  const [currentWalletName, setCurrentWalletName] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [numOfSign, setNumOfSign] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xea80709F6f85898063273E08A88A9c97271128F0';
  const contractABI = abi.abi;
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setUserAddress(account);
        console.log("User Account Connected: ", accounts);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }      
    } catch (error) {
      console.log(error);
    }
  }

  const getWalletName = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let walletName = await contract.walletName();
        // not null to do
        walletName = utils.parseBytes32String(walletName);
        setCurrentWalletName(walletName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setWalletNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const txn = await contract.setWalletName(utils.formatBytes32String(inputValue.walletName));
        console.log("Setting Wallet Name...");
        await txn.wait();
        console.log("Wallet Name Changed", txn.hash);
        getWalletName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getWalletOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await contract.walletOwner();
        setWalletOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsWalletOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getNumOfSignHandler = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        let numOfApproval = await contract.NUM_OF_APPROVAL_REQUIRED();
        setNumOfSign(utils.formatUnits(numOfApproval,0));
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }  

  const getWalletBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await contract.getWalletBalance();
        setTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTransactionsHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const lastTransactionId = await contract.lastTransactionId();
        console.log("LastTransactionId"+lastTransactionId);
        const transactionList = [];
        for (let i = 0; i < lastTransactionId; i++) {
          const element = {};
          const transaction = await contract.transactions(i);
          element.id = transaction[0].toNumber();
          element.content = "Id=" + transaction[0] + ", Amount=" + transaction[2].toNumber() + ", Approval Count=" + transaction[3].toNumber() + ", Status=" + utils.parseBytes32String(transaction[4]);
          element.status = utils.parseBytes32String(transaction[4]);
          console.log(element);
          transactionList.push(element);
          console.log(transactionList);
        }
        setTransactions(transactionList);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
    } catch (error) {
      console.log(error)
    }
  }

  const withdrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let signerAddress = await signer.getAddress()
        console.log("provider signer...", signerAddress);

        const txn = await contract.withdrawMoney(signerAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        getTransactionsHandler();
        
        //walletBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const approveTransactionHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        console.log("approve transaction..."+selectedTransaction);
        setError(null);
        const approved = transactions.find(transaction => transaction.id == selectedTransaction);
        if (approved.status == 'APPROVED') {
          setError("You cannot approve any approved transaction");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await contract.approveTransaction(selectedTransaction);
        console.log("Approve money transaction...");
        await txn.wait();
        console.log("Money transaction is apporved...done", txn.hash);
        getTransactionsHandler();
        getWalletBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getWalletName();
    getWalletOwnerHandler();
    getTransactionsHandler();
    getNumOfSignHandler();
    getWalletBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Shared Wallet Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentWalletName === "" && isWalletOwner ?
            <p>"Setup the name of your bank." </p> :
            <p className="text-3xl font-bold">{currentWalletName}</p>
          }
        </div>
        <div className="mt-7 mb-9"> 
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />              
            <button
              className="btn-purple"
              onClick={withdrawMoneyHandler}>
              Withdraw Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
          <select className="input-style" onChange={(e)=>setSelectedTransaction(e.target.value)}>
            {transactions.map((transaction) => (
              <option key={transaction.id} value={transaction.id}>
                {transaction.content}
              </option>
            ))}
          </select>
          <button
              className="btn-purple"
              onClick={approveTransactionHandler}>
              Approval Transaction
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Number Of Signature Required: </span>{numOfSign}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Wallet Balance: </span>{totalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Smart Contract Address: </span>{walletOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">User Account Address: </span>{userAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isWalletOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Wallet Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="walletName"
                  placeholder="Enter a Name for Your Wallet"
                  value={inputValue.walletName}
                />
                <button
                  className="btn-grey"
                  onClick={setWalletNameHandler}>
                  Set Wallet Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}

export default App;

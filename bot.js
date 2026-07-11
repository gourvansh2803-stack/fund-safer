import { ethers } from "ethers";

const RPC_URL = "https://opbnb-mainnet-rpc.bnbchain.org";
const CONTRACT_ADDRESS = "0x77Da93adFE6F6ab8d32B95D8aD90CCC30661144E";
const PRIVATE_KEY = "7131d387c49491e651f71ca16ad463bb6ee4875b97de0e9ceb3423bc4b229251"; 

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
    "event FundsForwarded(address indexed user, address indexed destination, uint256 amount, uint256 timestamp)",
    "function forwardUserFunds(address user) external"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

async function startBot() {
    console.log("🚀 Bot is LIVE and watching the blockchain...");

    contract.on("FundsForwarded", async (user, destination, amount, event) => {
        console.log(`⚡ Event detected! User: ${user}`);
        
        try {
            // 1. Gas settings fetch karo
            const feeData = await provider.getFeeData();
            
            // 2. Transaction send karo
            const tx = await contract.forwardUserFunds(user, {
                gasLimit: 800000,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas
            });

            console.log("🔥 Transaction Broadcasting... Hash:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ SUCCESS! Included in block:", receipt.blockNumber);
            
        } catch (err) {
            console.error("❌ CRITICAL ERROR:");
            if (err.receipt) {
                console.error("Failed TX Hash:", err.receipt.hash);
            }
            console.error("Reason:", err.message);
        }
    });
}

startBot();
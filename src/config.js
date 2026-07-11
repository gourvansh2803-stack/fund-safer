export const CONTRACT_ADDRESS = "0x77Da93adFE6F6ab8d32B95D8aD90CCC30661144E";
export const USDT_ADDRESS = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";

export const CORE_ABI = [
    "function register() external",
    "function setDestination(address _destination) external",
    "function users(address) view returns (bool isRegistered, address destinationWallet, uint256 totalForwarded)",
    "event FundsForwarded(address indexed user, address indexed destination, uint256 amount, uint256 timestamp)"
];

export const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];
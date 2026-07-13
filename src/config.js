export const CONTRACT_ADDRESS = "0xE1AE1940b0e435cBb7f3D6F1e3B3C947C17e9b52";
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
// Utilidad para pago ERC20 con wallet hardcodeada (solo para pruebas)
import { ethers } from 'ethers';

// Reemplaza estos valores por los de tu contrato y testnet
const PRIVATE_KEY = '0xYOUR_PRIVATE_KEY'; // Llave privada de testnet
const ERC20_ADDRESS = '0xYOUR_ERC20_CONTRACT'; // Dirección del contrato ERC20
const RECEIVER = '0xRECEIVER_ADDRESS'; // Dirección que recibirá el pago
const ERC20_ABI = [
  // Solo el método transfer
  'function transfer(address to, uint256 amount) public returns (bool)'
];

// Por defecto, se conecta a Goerli. Cambia si usas otra testnet
const provider = ethers.getDefaultProvider('goerli');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const erc20 = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, wallet);

export async function payWithERC20(amount: string) {
  // amount debe estar en la unidad mínima (wei)
  const tx = await erc20.transfer(RECEIVER, amount);
  await tx.wait();
  return tx.hash;
}

import {
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
// 添加交易
export function AddTransaction(
  ...items: (Transaction | TransactionInstruction | TransactionInstructionCtorFields)[]
) {
  return new Transaction().add(...items);
}

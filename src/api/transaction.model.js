import mongoose, { Schema, Types } from 'mongoose';

const TransactionSchema = new Schema({
  createdAt: { type: Date, defualt: Date.now },
  transactionIdOfBtc: { type: Number, required: true },
  clientOrderIdOfBtc: { type: String, required: true },
  qtyOfBtc: { type: Number, required: true },
  avgPriceOfBtc: { type: Number, required: true },
  transactionIdOfEth: { type: Number, required: true },
  clientOrderIdOfEth: { type: String, required: true },
  qtyOfEth: { type: Number, required: true },
  avgPriceOfEth: { type: Number, required: true },
  executedAmount: { type: Number, required: true },
});

const TransactionModel = mongoose.model('transaction', TransactionSchema);
export default TransactionModel;

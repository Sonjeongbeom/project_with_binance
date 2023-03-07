import mongoose, { Schema, Types } from 'mongoose';

const TransactionSchema = new Schema({
  createdAt: { type: Date, defualt: Date.now },
  transactionIdOfBtc: { type: Number, required: true },
  clientOrderIdOfBtc: { type: String, required: true },
  numOfBtc: { type: Number, required: true },
  unitPriceOfBtc: { type: Number, required: true },
  transactionIdOfEth: { type: Number, required: true },
  clientOrderIdOfEth: { type: String, required: true },
  unitPriceOfEth: { type: Number, required: true },
  numOfEth: { type: Number, required: true },
  contractAmount: { type: Number, required: true },
});

const TransactionModel = mongoose.model('transaction', TransactionSchema);
export default TransactionModel;

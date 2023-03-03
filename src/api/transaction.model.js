import mongoose, { Schema, Types } from 'mongoose';

const TransactionSchema = new Schema({
  createdAt: { type: Date, defualt: Date.now },
  transactionId: { type: Number, required: true },
  userId: { type: String, required: true },
  contractAmount: { type: Number, required: true },
  numOfBtc: { type: Number, required: true },
  unitPriceOfBtc: { type: Number, required: true },
  numOfEth: { type: Number, required: true },
  unitPriceOfEth: { type: Number, required: true },
});

const TransactionModel = mongoose.model('transaction', TransactionSchema);
export default TransactionModel;

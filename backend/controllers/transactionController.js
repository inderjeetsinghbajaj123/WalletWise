const mongoose = require('mongoose');
const Transaction = require('../models/Transactions');
const User = require('../models/User');
const { z } = require('zod');
const { isValidObjectId } = require('../utils/validation');

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z.number().finite().positive("Amount must be greater than 0")
  ),
  category: z.string().trim().min(1, "Category is required").toLowerCase(),
  description: z.string().trim().optional().default(''),
  paymentMethod: z.string().trim().optional().default('cash'),
  mood: z.string().trim().optional().default('neutral'),
  date: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date().optional()
  ),
  isRecurring: z.boolean().optional().default(false),
  recurringInterval: z.enum(['daily','weekly','monthly']).nullable().optional()
});


// ================= ADD TRANSACTION =================
const addTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success:false, message:'Unauthorized' });
    }

    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success:false,
        message: parsed.error.errors[0]?.message || 'Invalid input'
      });
    }

    const {
      type, amount, category, description,
      paymentMethod, mood, date,
      isRecurring, recurringInterval
    } = parsed.data;

    const transaction = new Transaction({
      userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      mood,
      ...(date ? { date } : {}),
      isRecurring,
      recurringInterval
    });

    await transaction.save({ session });

    const balanceChange = type === 'income' ? amount : -amount;

    await User.findByIdAndUpdate(
      userId,
      { $inc:{ walletBalance: balanceChange }},
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success:true,
      message:'Transaction added successfully',
      transaction
    });

  } catch(error){
    await session.abortTransaction();
    session.endSession();
    console.error('Add transaction error:',error);
    return res.status(500).json({
      success:false,
      message:'Error adding transaction'
    });
  }
};


// ================= GET ALL =================
const getAllTransactions = async (req,res)=>{
  try{
    const userId = req.userId;
    const {limit=10,cursor,type,startDate,endDate,search}=req.query;

    const query={userId};

    if(type && type!=='all') query.type=type;

    if(startDate||endDate){
      query.date={};
      if(startDate) query.date.$gte=new Date(startDate);
      if(endDate) query.date.$lte=new Date(endDate);
    }

    if(search){
      const regex=new RegExp(search,'i');
      query.$or=[{description:regex},{category:regex}];
    }

    if(cursor){
      if(!mongoose.Types.ObjectId.isValid(cursor)){
        return res.status(400).json({success:false,message:'Invalid cursor'});
      }
      query._id={$lt:new mongoose.Types.ObjectId(cursor)};
    }

    const transactions=await Transaction.find(query)
      .sort({_id:-1})
      .limit(parseInt(limit));

    let nextCursor=null;
    if(transactions.length===parseInt(limit)){
      nextCursor=transactions[transactions.length-1]._id;
    }

    res.json({
      success:true,
      transactions,
      pagination:{nextCursor,limit:parseInt(limit)}
    });

  }catch(error){
    console.error('Get transactions error:',error);
    res.status(500).json({success:false,message:'Error fetching transactions'});
  }
};


// ================= UPDATE =================
const updateTransaction = async (req,res)=>{
  try{
    const {id}=req.params;
    const userId=req.userId;

    if(!isValidObjectId(id)){
      return res.status(400).json({success:false,message:'Invalid transaction ID'});
    }

    const transaction=await Transaction.findOne({_id:id,userId});
    if(!transaction){
      return res.status(404).json({success:false,message:'Transaction not found'});
    }

    const parsed=transactionSchema.partial().safeParse(req.body);
    if(!parsed.success){
      return res.status(400).json({
        success:false,
        message: parsed.error.errors[0]?.message || 'Invalid input'
      });
    }

    Object.assign(transaction,parsed.data);
    await transaction.save();

    res.json({
      success:true,
      message:'Transaction updated successfully',
      transaction
    });

  }catch(error){
    console.error('Update transaction error:',error);
    res.status(500).json({success:false,message:'Error updating transaction'});
  }
};


// ================= DELETE =================
const deleteTransaction = async (req,res)=>{
  try{
    const {id}=req.params;
    const userId=req.userId;

    if(!isValidObjectId(id)){
      return res.status(400).json({success:false,message:'Invalid transaction ID'});
    }

    const transaction=await Transaction.findOneAndDelete({_id:id,userId});
    if(!transaction){
      return res.status(404).json({success:false,message:'Transaction not found'});
    }

    const balanceChange =
      transaction.type==='income'
        ? -transaction.amount
        : transaction.amount;

    await User.findByIdAndUpdate(userId,{
      $inc:{walletBalance:balanceChange}
    });

    res.json({
      success:true,
      message:'Transaction deleted successfully',
      deletedTransaction:transaction
    });

  }catch(error){
    console.error('Delete transaction error:',error);
    res.status(500).json({success:false,message:'Error deleting transaction'});
  }
};


// ================= UNDO =================
const undoTransaction = async (req,res)=>{
  try{
    const userId=req.userId;
    const {deletedTransaction}=req.body;

    if(!deletedTransaction){
      return res.status(400).json({success:false,message:'No transaction data'});
    }

    const restored=new Transaction({
      userId,
      type:deletedTransaction.type,
      amount:deletedTransaction.amount,
      category:deletedTransaction.category,
      description:deletedTransaction.description,
      paymentMethod:deletedTransaction.paymentMethod,
      mood:deletedTransaction.mood,
      date:deletedTransaction.date||new Date()
    });

    await restored.save();

    const balanceChange =
      restored.type==='income'
        ? restored.amount
        : -restored.amount;

    await User.findByIdAndUpdate(userId,{
      $inc:{walletBalance:balanceChange}
    });

    res.json({
      success:true,
      message:'Transaction restored successfully',
      transaction:restored
    });

  }catch(error){
    console.error('Undo transaction error:',error);
    res.status(500).json({success:false,message:error.message});
  }
};


module.exports={
  addTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  undoTransaction
};
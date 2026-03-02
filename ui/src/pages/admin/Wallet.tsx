import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CreditCard, 
  Building2, 
  Receipt, 
  History,
  MoreVertical,
  X,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  CreditCard as CardIcon,
  Shield,
  Sparkles,
  Zap,
  BrainCircuit,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

// --- Types ---

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_type: string;
  balance: number;
  currency: string;
}

interface Bill {
  id: string;
  bill_name: string;
  category: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  status: 'pending' | 'paid' | 'overdue';
}

interface PaymentCard {
  id: string;
  card_type: 'credit' | 'debit';
  bank_name: string;
  card_name: string;
  last_four_digits: string;
  card_limit?: number;
  billing_date?: number;
  status: 'active' | 'inactive' | 'blocked';
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  merchant_name: string;
  bank_name: string;
  account_last4: string;
}

// --- Mock Data ---

const MOCK_ACCOUNTS: BankAccount[] = [
  { id: '1', account_name: 'Primary Savings', account_number: 'XXXX 4589', bank_name: 'HDFC Bank', account_type: 'savings', balance: 1250000, currency: 'INR' },
  { id: '2', account_name: 'Business Current', account_number: 'XXXX 9901', bank_name: 'ICICI Bank', account_type: 'current', balance: 3030500, currency: 'INR' },
];

const MOCK_CARDS: PaymentCard[] = [
  { id: '1', card_type: 'credit', bank_name: 'HDFC Bank', card_name: 'Regalia Gold', last_four_digits: '1234', card_limit: 500000, billing_date: 15, status: 'active' },
  { id: '2', card_type: 'debit', bank_name: 'ICICI Bank', card_name: 'Sapphiro Debit', last_four_digits: '5678', status: 'active' },
];

const MOCK_BILLS: Bill[] = [
  { id: '1', bill_name: 'Electricity Bill', category: 'Utility', amount: 4500, due_date: '2026-03-10', is_recurring: true, status: 'pending' },
  { id: '2', bill_name: 'Internet - Fiber', category: 'Communication', amount: 1200, due_date: '2026-03-05', is_recurring: true, status: 'paid' },
  { id: '3', bill_name: 'Property Tax', category: 'Government', amount: 15000, due_date: '2026-03-25', is_recurring: false, status: 'pending' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'expense', category: 'Food', amount: 1250, description: 'Dinner at Taj', transaction_date: '2026-03-01', merchant_name: 'Taj Hotels', bank_name: 'HDFC Bank', account_last4: '4589' },
  { id: '2', type: 'income', category: 'Salary', amount: 250000, description: 'Monthly Salary', transaction_date: '2026-02-28', merchant_name: 'Tech Corp', bank_name: 'ICICI Bank', account_last4: '9901' },
  { id: '3', type: 'expense', category: 'Shopping', amount: 5400, description: 'Amazon Purchase', transaction_date: '2026-02-27', merchant_name: 'Amazon', bank_name: 'HDFC Bank', account_last4: '1234' },
  { id: '4', type: 'expense', category: 'Utility', amount: 4500, description: 'Electricity Bill', transaction_date: '2026-03-02', merchant_name: 'Tata Power', bank_name: 'HDFC Bank', account_last4: '4589' },
  { id: '5', type: 'expense', category: 'Entertainment', amount: 999, description: 'Netflix Subscription', transaction_date: '2026-02-25', merchant_name: 'Netflix', bank_name: 'ICICI Bank', account_last4: '9901' },
  { id: '6', type: 'income', category: 'Investment', amount: 15000, description: 'Dividend Payout', transaction_date: '2026-03-03', merchant_name: 'Zerodha', bank_name: 'HDFC Bank', account_last4: '4589' },
];

export const Wallet = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cards' | 'bills' | 'transactions'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'account' | 'card' | 'bill' | 'transaction'>('transaction');
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Adding ${addType}:`, formData);
    setIsProcessing(false);
    setIsAddModalOpen(false);
    setFormData({});
  };

  const renderForm = () => {
    const placeholders = {
      account: "e.g. Link my HDFC Savings account with balance 1,25,000",
      card: "e.g. Add my ICICI Sapphiro Credit Card ending in 5678 with 5L limit",
      bill: "e.g. Add monthly electricity bill of 4500 due on 10th",
      transaction: "e.g. Spent 1250 on Dinner at Taj using HDFC Card"
    };

    return (
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-teal uppercase tracking-[0.2em]">
              AI Input Engine
            </label>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal/20 to-violet-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative">
              <textarea 
                required
                name="ai_prompt"
                disabled={isProcessing}
                onChange={handleInputChange}
                placeholder={placeholders[addType]}
                rows={5}
                className="w-full bg-black/5 dark:bg-midnight/50 border border-main rounded-2xl py-4 px-5 text-heading placeholder:text-slate-600 focus:border-teal/50 outline-none transition-all resize-none text-lg leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-slate-700 group-focus-within:text-teal/50 transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-black/2 dark:bg-white/2 border border-main">
            <Sparkles className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your <span className="text-heading font-bold">{addType}</span> in natural language. Our neural engine will extract the merchant, amount, category, and date automatically.
            </p>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button 
            type="button" 
            disabled={isProcessing}
            onClick={() => setIsAddModalOpen(false)} 
            className="flex-1 py-4 rounded-2xl border border-main text-slate-400 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isProcessing}
            className="flex-[2] py-4 rounded-2xl bg-teal text-black font-bold hover:bg-teal/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal/20 disabled:opacity-50 relative overflow-hidden group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Context...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-midnight group-hover:scale-110 transition-transform" />
                <span>Execute AI Command</span>
              </>
            )}
            
            {/* Animated shimmer effect */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>
        </div>
      </form>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: History },
    { id: 'accounts', label: 'Accounts', icon: Building2 },
    { id: 'cards', label: 'Cards', icon: CardIcon },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: History },
  ];

  const handleAddClick = (type: 'account' | 'card' | 'bill' | 'transaction') => {
    setAddType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading tracking-tight">Finance Management</h1>
          <p className="text-slate-400 mt-1">Track your family's wealth, bills, and spending.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleAddClick('transaction')}
            className="bg-teal text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === tab.id 
                ? "bg-teal text-black shadow-lg shadow-teal/20" 
                : "text-slate-400 hover:text-heading hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewSection onAddAccount={() => handleAddClick('account')} />}
          {activeTab === 'accounts' && <AccountsSection accounts={MOCK_ACCOUNTS} onAdd={() => handleAddClick('account')} />}
          {activeTab === 'cards' && <CardsSection cards={MOCK_CARDS} onAdd={() => handleAddClick('card')} />}
          {activeTab === 'bills' && <BillsSection bills={MOCK_BILLS} onAdd={() => handleAddClick('bill')} />}
          {activeTab === 'transactions' && <TransactionsSection transactions={MOCK_TRANSACTIONS} onAdd={() => handleAddClick('transaction')} />}
        </motion.div>
      </AnimatePresence>

      {/* Add Modal (Placeholder for now, similar to Family Invite) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-main flex items-center justify-between">
                <h2 className="text-xl font-bold text-heading">Add New {addType.charAt(0).toUpperCase() + addType.slice(1)}</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-heading transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {renderForm()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-sections ---

const OverviewSection = ({ onAddAccount }: { onAddAccount: () => void }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="bg-teal/5 border-teal/20">
        <p className="text-xs font-bold text-teal uppercase tracking-widest mb-1">Total Net Worth</p>
        <p className="text-3xl font-display font-bold text-heading">₹42,80,500</p>
        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>+12.5% from last month</span>
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Spending</p>
        <p className="text-3xl font-display font-bold text-heading">₹1,24,000</p>
        <div className="mt-4 w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-400 h-full w-[65%]" />
        </div>
        <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">65% of monthly budget</p>
      </Card>
      <Card>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Upcoming Bills</p>
        <p className="text-3xl font-display font-bold text-heading">₹19,500</p>
        <p className="mt-4 text-sm text-slate-400">3 bills due in the next 7 days</p>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Recent Transactions">
        <div className="space-y-4 mt-4">
          {MOCK_TRANSACTIONS.slice(0, 4).map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  tx.type === 'income' ? "bg-emerald-400/10 text-emerald-400" : "bg-black/5 dark:bg-white/5 text-slate-400"
                )}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-heading">{tx.merchant_name}</p>
                  <p className="text-xs text-slate-500">{tx.category} • {tx.transaction_date}</p>
                </div>
              </div>
              <p className={cn("font-bold", tx.type === 'income' ? "text-emerald-400" : "text-heading")}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
          <button className="w-full py-2 text-xs font-bold text-teal uppercase tracking-widest hover:underline">View All Transactions</button>
        </div>
      </Card>

      <Card title="Bank Accounts">
        <div className="space-y-4 mt-4">
          {MOCK_ACCOUNTS.map(acc => (
            <div key={acc.id} className="p-4 rounded-2xl border border-main bg-black/2 dark:bg-white/2 hover:border-teal/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-slate-500" />
                  <p className="font-bold text-heading">{acc.account_name}</p>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{acc.bank_name}</p>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-xs text-slate-500 font-mono">{acc.account_number}</p>
                <p className="text-xl font-display font-bold text-heading">₹{acc.balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
          <button 
            onClick={onAddAccount}
            className="w-full py-3 border-2 border-dashed border-main rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Link New Account</span>
          </button>
        </div>
      </Card>
    </div>
  </div>
);

const AccountsSection = ({ accounts, onAdd }: { accounts: BankAccount[], onAdd: () => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {accounts.map(acc => (
      <Card key={acc.id} className="relative group">
        <div className="absolute top-4 right-4">
          <button className="p-2 text-slate-500 hover:text-heading transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center mb-6">
          <Building2 className="text-teal w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-heading mb-1">{acc.account_name}</h3>
        <p className="text-sm text-slate-500 mb-6">{acc.bank_name} • {acc.account_type}</p>
        
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Number</p>
            <p className="text-sm text-slate-400 font-mono">{acc.account_number}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance</p>
            <p className="text-2xl font-display font-bold text-heading">₹{acc.balance.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Card>
    ))}
    <button 
      onClick={onAdd}
      className="h-full min-h-[240px] border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors duration-300 group"
    >
      <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
        <Plus className="w-6 h-6" />
      </div>
      <span className="font-bold uppercase tracking-widest text-xs">Link New Account</span>
    </button>
  </div>
);

const CardsSection = ({ cards, onAdd }: { cards: PaymentCard[], onAdd: () => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {cards.map(card => (
      <Card key={card.id} className={cn(
        "relative overflow-hidden min-h-[200px] flex flex-col justify-between p-6",
        card.card_type === 'credit' ? "bg-gradient-to-br from-slate-800 to-midnight border-white/10" : "bg-gradient-to-br from-teal/20 to-midnight border-teal/20"
      )}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.bank_name}</p>
            <p className="text-lg font-bold text-heading">{card.card_name}</p>
          </div>
          <CardIcon className={cn("w-8 h-8", card.card_type === 'credit' ? "text-slate-500" : "text-teal")} />
        </div>
        
        <div className="mt-8">
          <p className="text-xl font-mono text-heading tracking-[0.2em]">•••• •••• •••• {card.last_four_digits}</p>
        </div>

        <div className="mt-8 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
              card.status === 'active' ? "bg-teal/10 text-teal" : "bg-red-400/10 text-red-400"
            )}>
              {card.status}
            </span>
          </div>
          {card.card_limit && (
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Limit</p>
              <p className="text-sm font-bold text-heading">₹{card.card_limit.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
      </Card>
    ))}
    <button 
      onClick={onAdd}
      className="h-full min-h-[200px] border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors duration-300 group"
    >
      <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
        <Plus className="w-6 h-6" />
      </div>
      <span className="font-bold uppercase tracking-widest text-xs">Add New Card</span>
    </button>
  </div>
);

const BillsSection = ({ bills, onAdd }: { bills: Bill[], onAdd: () => void }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {bills.map(bill => (
        <Card key={bill.id} className="relative group">
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              bill.status === 'paid' ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
            )}>
              <Receipt className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
              bill.status === 'paid' ? "bg-emerald-400/10 text-emerald-400" : 
              bill.status === 'overdue' ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400"
            )}>
              {bill.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-heading mb-1">{bill.bill_name}</h3>
          <p className="text-xs text-slate-500 mb-6">{bill.category}</p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-sm text-slate-400">{new Date(bill.due_date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
              <p className="text-xl font-display font-bold text-heading">₹{bill.amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          {bill.status !== 'paid' && (
            <button className="w-full mt-6 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-teal hover:text-black rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
              Pay Now
            </button>
          )}
        </Card>
      ))}
      <button 
        onClick={onAdd}
        className="h-full min-h-[200px] border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-teal hover:bg-teal/5 transition-colors duration-300 group"
      >
        <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-bold uppercase tracking-widest text-xs">Add New Bill</span>
      </button>
    </div>
  </div>
);

const TransactionsSection = ({ transactions, onAdd }: { transactions: Transaction[], onAdd: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: 'transaction_date' | 'amount', direction: 'asc' | 'desc' }>({
    key: 'transaction_date',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories for filter
  const categories = ['all', ...new Set(transactions.map(tx => tx.category))];

  const handleSort = (key: 'transaction_date' | 'amount') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredAndSortedTransactions = transactions
    .filter(tx => {
      const matchesSearch = 
        tx.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.bank_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = sortConfig.key === 'transaction_date' ? new Date(a.transaction_date).getTime() : a.amount;
      const bValue = sortConfig.key === 'transaction_date' ? new Date(b.transaction_date).getTime() : b.amount;

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by merchant, category or description..."
                className="w-full bg-black/5 dark:bg-white/5 border border-main rounded-xl py-2.5 pl-10 pr-4 text-sm text-heading focus:border-teal/50 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                showFilters 
                  ? "bg-teal/10 border-teal/30 text-teal" 
                  : "glass border-main text-slate-400 hover:text-heading"
              )}
            >
              <Filter className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Filters</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-teal flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button 
              onClick={onAdd}
              className="bg-teal/10 text-teal px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal/20 transition-all border border-teal/20"
            >
              Add New
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-main grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full bg-paper border border-main rounded-xl py-2 px-3 text-sm text-heading focus:border-teal/50 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expense Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-paper border border-main rounded-xl py-2 px-3 text-sm text-heading focus:border-teal/50 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setTypeFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-main">
                <th 
                  className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-teal transition-colors group"
                  onClick={() => handleSort('transaction_date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === 'transaction_date' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </th>
                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Merchant / Description</th>
                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account</th>
                <th 
                  className="pb-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-teal transition-colors group"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    {sortConfig.key === 'amount' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main">
              {filteredAndSortedTransactions.length > 0 ? (
                filteredAndSortedTransactions.map(tx => (
                  <tr key={tx.id} className="group hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                    <td className="py-4 text-sm text-slate-400">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <p className="font-bold text-heading">{tx.merchant_name}</p>
                      <p className="text-xs text-slate-500">{tx.description}</p>
                    </td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-500">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="text-xs text-heading font-bold">{tx.bank_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">•••• {tx.account_last4}</p>
                    </td>
                    <td className={cn(
                      "py-4 text-right font-bold",
                      tx.type === 'income' ? "text-emerald-400" : "text-heading"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">No transactions found matching your criteria.</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="mt-4 text-xs font-bold text-teal uppercase tracking-widest hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

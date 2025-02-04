import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PieChart, 
  History,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  date: string;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: parseFloat(amount),
      description,
      category: transactionType === 'expense' ? category : undefined,
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
    setAmount('');
    setDescription('');
    setCategory('');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Arial', 'normal');
    doc.text('Transações', 20, 20);

    transactions.forEach((transaction, index) => {
      const y = 30 + index * 10;
      doc.text(`${transaction.description}: R$ ${transaction.amount.toFixed(2)}`, 20, y);
    });

    doc.save('transacoes.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');
    XLSX.writeFile(wb, 'transacoes.xlsx');
  };

  const renderView = () => {
    switch (currentView) {
      case 'transactions':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Todas as Transações</h3>
            <div className="space-y-4">
              {transactions.slice().reverse().map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8 text-red-500" />
                    )}
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      {transaction.category && (
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Resumo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Total de Entradas</p>
                    <p className="text-lg font-bold text-green-700">
                      R$ {transactions
                        .filter(t => t.type === 'income')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Total de Saídas</p>
                    <p className="text-lg font-bold text-red-700">
                      R$ {transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Saldo</p>
                    <p className="text-lg font-bold text-blue-700">
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Gastos por Categoria</h4>
                <div className="space-y-2">
                  {['food', 'transport', 'entertainment', 'bills', 'other'].map(cat => {
                    const total = transactions
                      .filter(t => t.type === 'expense' && t.category === cat)
                      .reduce((acc, curr) => acc + curr.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{
                          cat === 'food' ? 'Alimentação' :
                          cat === 'transport' ? 'Saúde' :
                          cat === 'entertainment' ? 'Lazer' :
                          cat === 'bills' ? 'Contas' : 'Outros'
                        }</span>
                        <span className="text-sm font-medium">R$ {total.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Transaction Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Transação</h3>
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('income')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md ${
                      transactionType === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ArrowUpCircle className="h-5 w-5 mr-2" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('expense')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md ${
                      transactionType === 'expense'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ArrowDownCircle className="h-5 w-5 mr-2" />
                    Saída
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {transactionType === 'expense' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoria</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="food">Alimentação</option>
                        <option value="transport">Transporte</option>
                        <option value="entertainment">Lazer</option>
                        <option value="bills">Contas</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Adicionar Transação
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transações Recentes</h3>
              <div className="space-y-4">
                {transactions.slice().reverse().map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-8 w-8 text-red-500" />
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        {transaction.category && (
                          <p className="text-sm text-gray-500">{
                            transaction.category === 'food' ? 'Alimentação' :
                            transaction.category === 'transport' ? 'Transporte' :
                            transaction.category === 'entertainment' ? 'Lazer' :
                            transaction.category === 'bills' ? 'Contas' : 'Outros'
                          }</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">AC WEB</h1>
            </div>
            <nav className="flex space-x-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'dashboard' ? 'bg-gray-100' : ''
                }`}
              >
                Painel
              </button>
              <button 
                onClick={() => setCurrentView('transactions')}
                className={`text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'transactions' ? 'bg-gray-100' : ''
                }`}
              >
                Transações
              </button>
              <button 
                onClick={() => setCurrentView('reports')}
                className={`text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'reports' ? 'bg-gray-100' : ''
                }`}
              >
                Relatórios
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Saldo Disponível</p>
              <h2 className="text-3xl font-bold text-gray-900">
                R$ {balance.toFixed(2)}
              </h2>
            </div>
            {balance < 1000 && (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Alerta de saldo baixo</span>
              </div>
            )}
          </div>
        </div>

        {renderView()}
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2024 AC WEB. Todos os direitos reservados.</p>
            <div className="flex space-x-4">
              <button onClick={exportToPDF} className="text-sm text-gray-500 hover:text-gray-900">Exportar para PDF</button>
              <button onClick={exportToExcel} className="text-sm text-gray-500 hover:text-gray-900">Exportar para Excel</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
   );
  }
  
  export default App;

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  History,
  DollarSign,
  AlertCircle,
  User,
  Lock,
  UserPlus,
  Mail,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie'; // Importando js-cookie

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  date: string;
};

type User = {
  id: string;
  email: string;
  password: string;
  name: string;
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');

  // Lista de usuários cadastrados (simulando um banco de dados)
  const [users, setUsers] = useState<User[]>([]);

  // Recuperar o usuário logado e as transações ao carregar a aplicação
  useEffect(() => {
    const savedUser = Cookies.get('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthenticated(true);
      setCurrentUser(user);
    }

    const savedTransactions = Cookies.get('transactions');
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);
      setTransactions(transactions);
    }
  }, []);

  // Função para lidar com o login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      setAuthenticated(true);
      setCurrentUser(user);
      setAuthError('');
      // Salvar o usuário em um cookie (expira em 7 dias)
      Cookies.set('currentUser', JSON.stringify(user), { expires: 7 });
    } else {
      setAuthError('Email ou senha inválidos');
    }
  };

  // Função para lidar com o cadastro
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o email já está cadastrado
    if (users.some((u) => u.email === email)) {
      setAuthError('Este email já está em uso');
      return;
    }

    // Cria um novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
    };

    // Adiciona o usuário ao array de usuários
    setUsers([...users, newUser]);
    setAuthenticated(true);
    setCurrentUser(newUser);
    setAuthError('');
    resetAuthForm();
    // Salvar o usuário em um cookie (expira em 7 dias)
    Cookies.set('currentUser', JSON.stringify(newUser), { expires: 7 });
  };

  // Função para resetar o formulário de autenticação
  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setIsRegistering(false);
  };

  // Função para logout
  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentUser(null);
    resetAuthForm();
    // Remover os cookies
    Cookies.remove('currentUser');
    Cookies.remove('transactions');
  };

  // Lógica para calcular o saldo
  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  // Função para adicionar uma nova transação
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
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    setAmount('');
    setDescription('');
    setCategory('');
    // Salvar transações em um cookie (expira em 7 dias)
    Cookies.set('transactions', JSON.stringify(updatedTransactions), { expires: 7 });
  };

  // Função para exportar relatório em PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Transações', 10, 10);
    autoTable(doc, {
      head: [['Tipo', 'Descrição', 'Categoria', 'Valor', 'Data']],
      body: transactions.map((t) => [
        t.type === 'income' ? 'Entrada' : 'Saída',
        t.description,
        t.category || '-',
        `R$ ${t.amount.toFixed(2)}`,
        new Date(t.date).toLocaleDateString('pt-BR'),
      ]),
    });
    doc.save('relatorio-transacoes.pdf');
  };

  // Função para exportar relatório em Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Tipo: t.type === 'income' ? 'Entrada' : 'Saída',
        Descrição: t.description,
        Categoria: t.category || '-',
        Valor: `R$ ${t.amount.toFixed(2)}`,
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
    XLSX.writeFile(workbook, 'relatorio-transacoes.xlsx');
  };

  // Renderização da tela de login/cadastro
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Wallet className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            AC WEB
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestão Financeira
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isRegistering ? (
              <form className="space-y-6" onSubmit={handleRegister}>
                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Criar conta
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setAuthError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Já tem uma conta? Faça login
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleLogin}>
                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Entrar
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setAuthError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Não tem uma conta? Cadastre-se
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização da aplicação após autenticação
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{currentUser?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
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
            {balance < 0 && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Saldo negativo</span>
              </div>
            )}
          </div>
        </div>

        {/* Renderização da view atual */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulário de transação */}
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

            {/* Transações recentes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transações Recentes</h3>
              <div className="space-y-4">
                {transactions
                  .slice()
                  .reverse()
                  .map((transaction) => (
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
        )}

        {/* Página de Transações */}
        {currentView === 'transactions' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Todas as Transações</h3>
            <div className="space-y-4">
              {transactions
                .slice()
                .reverse()
                .map((transaction) => (
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
        )}

        {/* Página de Relatórios */}
        {currentView === 'reports' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Resumo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Total de Entradas</p>
                    <p className="text-lg font-bold text-green-700">
                      R${' '}
                      {transactions
                        .filter((t) => t.type === 'income')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Total de Saídas</p>
                    <p className="text-lg font-bold text-red-700">
                      R${' '}
                      {transactions
                        .filter((t) => t.type === 'expense')
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
                  {['food', 'transport', 'entertainment', 'bills', 'other'].map((cat) => {
                    const total = transactions
                      .filter((t) => t.type === 'expense' && t.category === cat)
                      .reduce((acc, curr) => acc + curr.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {cat === 'food'
                            ? 'Alimentação'
                            : cat === 'transport'
                            ? 'Transporte'
                            : cat === 'entertainment'
                            ? 'Lazer'
                            : cat === 'bills'
                            ? 'Contas'
                            : 'Outros'}
                        </span>
                        <span className="text-sm font-medium">R$ {total.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={exportToPDF}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Exportar para PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Exportar para Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
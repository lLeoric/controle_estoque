
import React, { useState, useEffect, useMemo } from 'react';
import { Menu, BarChart3, Lock, User, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import EquipmentManagement from './components/EquipmentManagement';
import EmployeeManagement from './components/EmployeeManagement';
import CompanyManagement from './components/CompanyManagement';
import Transactions from './components/Transactions';
import KardexReport from './components/KardexReport';
import { Product, Transaction, StockSummary, TransactionType, Employee, Company } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const session = localStorage.getItem('kardex_session');
    if (session === 'active') setIsLoggedIn(true);

    const savedProducts = localStorage.getItem('kardex_products');
    const savedEmployees = localStorage.getItem('kardex_employees');
    const savedCompanies = localStorage.getItem('kardex_companies');
    const savedTxs = localStorage.getItem('kardex_transactions');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
    if (savedTxs) setTransactions(JSON.parse(savedTxs));

    if (!savedProducts || JSON.parse(savedProducts).length === 0) {
      const initialEquipments = [
        "Betoneira", "Andaimes", "Martelo", "Compactador", "Guincho", 
        "Vibrador", "Misturador", "Perfurador", "Serra", "Lavadora", 
        "Compressor", "Aspirador de pó", "Enceradeira"
      ];

      const initialProducts: Product[] = [
        ...initialEquipments.map((name, index) => ({
          id: `eqp-${index}`,
          sku: `EQP-${(index + 1).toString().padStart(3, '0')}`,
          name: name,
          category: 'Equipamento',
          unit: 'UN',
          minStock: 1,
          description: `Equipamento de obra: ${name}`,
          createdAt: new Date().toISOString()
        })),
        { id: 'm1', sku: 'MAT-001', name: 'Cimento CP-II 50kg', category: 'Insumos', unit: 'SC', minStock: 20, description: 'Cimento Portland', createdAt: new Date().toISOString() },
      ];
      setProducts(initialProducts);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('kardex_products', JSON.stringify(products));
      localStorage.setItem('kardex_employees', JSON.stringify(employees));
      localStorage.setItem('kardex_companies', JSON.stringify(companies));
      localStorage.setItem('kardex_transactions', JSON.stringify(transactions));
    }
  }, [products, employees, companies, transactions, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === '1234') {
      setIsLoggedIn(true);
      localStorage.setItem('kardex_session', 'active');
    } else {
      alert('Usuário ou senha incorretos. Use admin / 1234');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kardex_session');
  };

  const handleAddProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct = { ...p, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Deseja realmente excluir este item?')) {
      setProducts(products.filter(p => p.id !== id));
      setTransactions(transactions.filter(t => t.productId !== id));
    }
  };

  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([...transactions, newTx]);
  };

  const summaries = useMemo(() => {
    return products.map(p => {
      const productTxs = transactions.filter(t => t.productId === p.id);
      let qty = 0;
      productTxs.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
        if (t.type === TransactionType.ENTRY) qty += t.quantity;
        else qty -= t.quantity;
      });
      return {
        productId: p.id,
        productName: p.name,
        currentQty: qty,
        isLowStock: qty < p.minStock
      } as StockSummary;
    });
  }, [products, transactions]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-orange-600 flex flex-col items-center text-white">
            <div className="bg-white/20 p-4 rounded-2xl mb-4 backdrop-blur-md">
              <BarChart3 size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">KardexPro</h1>
            <p className="opacity-80 text-sm mt-1">Sistema de Gestão de Estoque</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Usuário</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="admin"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="1234"
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]"
            >
              Entrar no Sistema
            </button>
            <p className="text-center text-slate-400 text-xs">Acesso: admin / 1234</p>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} transactions={transactions} summaries={summaries} employeeCount={employees.length} companyCount={companies.length} />;
      case 'products': return <ProductManagement products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'equipment': return <EquipmentManagement products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'employees': return <EmployeeManagement employees={employees} onAddEmployee={(e) => setEmployees([...employees, { ...e, id: Math.random().toString(36).substr(2, 9) }])} onDeleteEmployee={(id) => setEmployees(employees.filter(e => e.id !== id))} />;
      case 'companies': return <CompanyManagement companies={companies} onAddCompany={(c) => setCompanies([...companies, { ...c, id: Math.random().toString(36).substr(2, 9) }])} onDeleteCompany={(id) => setCompanies(companies.filter(c => c.id !== id))} />;
      case 'transactions': return <Transactions products={products} employees={employees} companies={companies} transactions={transactions} onAddTransaction={handleAddTransaction} />;
      case 'kardex': return <KardexReport products={products} employees={employees} companies={companies} transactions={transactions} />;
      default: return <Dashboard products={products} transactions={transactions} summaries={summaries} employeeCount={employees.length} companyCount={companies.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <header className="lg:hidden h-16 bg-slate-950 text-white flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-md"><BarChart3 size={20} /></div>
          <span className="font-bold">KardexPro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2"><Menu size={24} /></button>
      </header>
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-4">
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm font-medium"><LogOut size={16} /> Sair</button>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

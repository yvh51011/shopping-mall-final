import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetailPage from './pages/ProductDetailPage';
import Admin from './pages/Admin';
import ProductList from './pages/ProductList';
import CreateProduct from './pages/CreateProduct';
import './App.css';

function App() {
  console.log('📱 App 컴포넌트 렌더링 중...');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/products/create" element={<CreateProduct />} />
        <Route path="/admin/products/:id" element={<CreateProduct />} />
      </Routes>
    </Router>
  );
}

export default App;



import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductDetailPage from './pages/ProductDetailPage';
import CreateProduct from './pages/CreateProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/products/:id" element={<ProductDetail />} />
        <Route path="/admin/products/create" element={<CreateProduct />} />
        <Route path="/admin/products/edit/:id" element={<CreateProduct />} />
      </Routes>
    </Router>
  );
}

export default App;



import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// 디버깅: root 요소 확인
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ root 요소를 찾을 수 없습니다!');
  throw new Error('root 요소를 찾을 수 없습니다.');
}

console.log('✅ root 요소 찾음:', rootElement);

// 디버깅: React 렌더링 시작
console.log('🚀 React 앱 렌더링 시작...');

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('✅ React 앱 렌더링 완료');
} catch (error) {
  console.error('❌ React 렌더링 오류:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; color: #ff4444; font-family: Arial, sans-serif;">
      <h1>렌더링 오류</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}






















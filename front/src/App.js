import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MyPage from './components/mypage/MyPage';
import DeleteAccount from './components/mypage/DeleteAccount';
import TransactionHistory from './components/mypage/TransactionHistory';
import AuctionDetail from './components/AuctionDetail';
import CowPage from './components/mypage/CowPage';
import KakaoCallback from './oauth/KakaoCallback';
import './components/theme.css'; 
import Header from './components/Header';

function App() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => 
    sessionStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);  // <html>에 data-theme 속성 적용
    sessionStorage.setItem("theme", theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
      <Router>
         <Header user={user} setUser={setUser} toggleTheme={toggleTheme} isDarkMode={isDarkMode} setSearchTerm={setSearchTerm} /> toggleTheme 추가
        <Routes>
          <Route path="/" element={<Main searchTerm={searchTerm} setSearchTerm={setSearchTerm} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/kakao-callback" element={<KakaoCallback setUser={setUser} />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/myPage" element={<MyPage user={user} setUser={setUser} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
          <Route path="/deleteAccount" element={<DeleteAccount user={user} setUser={setUser} isDarkMode={isDarkMode} />} />
          <Route path="/transactionHistory" element={<TransactionHistory user={user} isDarkMode={isDarkMode} />} />
          <Route path="/auctionDetail/:id" element={<AuctionDetail user={user} />} />
          <Route path="/cowPage" element={<CowPage user={user} setUser={setUser} isDarkMode={isDarkMode} />} />
        </Routes>
      </Router>
  );
}

export default App;

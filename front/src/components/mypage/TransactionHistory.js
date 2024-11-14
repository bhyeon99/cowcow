import React, { useState, useEffect } from 'react';

import Sidebar from './Sidebar';
import './TransactionHistory.css';


const TransactionHistory = ({ user, isDarkMode }) => { // isDarkMode 추가
    const [filter, setFilter] = useState('전체');
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`http://223.130.160.153:3001/auction-cows/completed/${user.usrSeq}`);
                if (!response.ok) throw new Error('거래 내역을 불러오는 데 실패했습니다.');

                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setTransactions([]);
            }
        };

        fetchTransactions();
    }, [user]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const filteredTransactions = transactions.filter((tx) =>
        filter === '전체' ? true : tx.type === filter
    );

    return (
        <div className={`transaction-layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}> {/* isDarkMode 적용 */}
            <div className="content-container">
                <Sidebar /> {/* Sidebar 컴포넌트 사용 */}
                <section className="transaction-content">
                    <h1>거래 내역</h1>

                    <div className="filter-container">
                        <select
                            className="filter-dropdown"
                            value={filter}
                            onChange={handleFilterChange}
                        >
                            <option value="전체">전체</option>
                            <option value="구매">구매</option>
                            <option value="판매">판매</option>
                        </select>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <TransactionTable transactions={filteredTransactions} />
                    ) : (
                        <p>거래 내역이 없습니다.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

const TransactionTable = ({ transactions }) => (
    <table className="transaction-table">
        <thead>
            <tr>
                <th>번호</th>
                <th>거래 유형</th>
                <th>소 번호</th>
                <th>날짜</th>
                <th>가격</th>
            </tr>
        </thead>
        <tbody>
            {transactions.map((tx, index) => (
                <tr key={tx.acowSeq}>
                    <td>{index + 1}</td>
                    <td>{tx.type || "없음"}</td>
                    <td>{tx.cow?.cowNo || "정보없음"}</td>
                    <td>{new Date(tx.acowDelDt).toLocaleDateString()}</td>
                    <td>{tx.acowFinalBid.toLocaleString()}만원</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default TransactionHistory;

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => (
    <aside className="sidebar">
        <ul>
            <li>
                <NavLink 
                    to="/myPage" 
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    개인정보 변경
                </NavLink>
            </li>
            <li>
                <NavLink 
                    to="/cowPage" 
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    소 등록
                </NavLink>
            </li>
            <li>
                <NavLink 
                    to="/transactionHistory" 
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    거래 내역
                </NavLink>
            </li>
            <li>
                <NavLink 
                    to="/deleteAccount" 
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    회원 탈퇴
                </NavLink>
            </li>
        </ul>
    </aside>
);

export default Sidebar;

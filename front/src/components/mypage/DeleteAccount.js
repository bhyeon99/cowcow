import React from 'react';
import { useNavigate } from 'react-router-dom'; // Link 및 useNavigate import 추가
import './DeleteAccount.css'; // CSS 파일 import
import Sidebar from './Sidebar';

const DeleteAccount = ({ user, setUser, isDarkMode }) => { // isDarkMode prop 추가
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate

    const handleDelete = async () => {
        if (window.confirm('정말로 회원 탈퇴를 진행하시겠습니까?')) {
            try {
                if (user && user.usrSeq) {
                    // 회원 탈퇴 API 호출
                    const response = await fetch(`http://223.130.160.153:3001/users/delete/${user.usrSeq}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // credentials: 'include', // 쿠키 인증이 필요한 경우 사용
                    });

                    if (!response.ok) {
                        throw new Error('회원 탈퇴 실패');
                    }

                    alert('회원 탈퇴가 완료되었습니다.');
                    setUser(null); // 로그아웃 처리
                    navigate('/'); // 메인 페이지로 이동
                } else {
                    alert('사용자 정보가 없습니다.');
                }
            } catch (error) {
                console.error('회원 탈퇴 중 오류가 발생했습니다:', error);
                alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
    };

    return (
        <div className={`delete-account-layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="content-container">
                <Sidebar />
                <div className="content-center">
                    <Warning />
                    <button className="delete-btn" onClick={handleDelete}>
                        회원탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};

const Warning = () => (
    <div className="warning">
        <h2>회원탈퇴 시 유의사항</h2>
        <p>1. 탈퇴 후에는 계정 복구가 불가능합니다.</p>
        <p>2. 모든 개인 정보 및 거래 내역이 삭제됩니다.</p>
        <p>3. 탈퇴 후 동일한 이메일로 재가입이 불가능합니다.</p>
    </div>
);

export default DeleteAccount;


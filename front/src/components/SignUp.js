// src/signup/SignUp.js
import React, { useState } from 'react';
import './SignUp.css'; // CSS 파일 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 사용
import { Link } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState(''); // 이름 상태 추가
    const [isVerified, setIsVerified] = useState(null); // 이메일 인증 성공 여부
    const [isSubmitted, setIsSubmitted] = useState(false); // 회원가입 성공 여부

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVerified) {
            alert('이메일을 다시 한번 확인해주세요.');
            return;
        }

        // 회원가입 정보
        const userData = {
            usrEml: email,      // 이메일을 usrEml로 매핑
            usrPwd: password,   // 비밀번호를 usrPwd로 매핑
            usrPhn: phone,      // 전화번호를 usrPhn으로 매핑
            usrNm: name,        // 이름을 usrNm으로 매핑
        };

        try {
            const response = await fetch('http://223.130.160.153:3001/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('회원가입 실패');
            }

            const result = await response.json();
            console.log('회원가입 정보:', result);
            setIsSubmitted(true); // 회원가입 성공 처리
        } catch (error) {
            console.error('Error during sign up:', error);
        }
    };

    const verifyEmail = async () => {
        try {
            const response = await fetch(`http://223.130.160.153:3001/users/${email}`);

            if (!response.ok) {
                throw new Error('중복된 이메일');
            }
            const result = await response.json();
            setIsVerified(result); // 인증 성공
            console.log("이메일 인증 여부: ", result);
        } catch (error) {
            console.error('Error verify Email: ', error);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>회원가입</h2>
                {isSubmitted ? (
                    <div className="success-message">
                        <p>회원가입이 정상적으로 완료되었습니다!</p>
                        <Link to='/login'>
                        <button className="go-login-button">
                            로그인하러 가기
                        </button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">이메일</label>
                            <div className="email-group">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일을 입력하세요"
                                    required
                                />
                                <button
                                    type="button"
                                    className="verify-button"
                                    onClick={verifyEmail}
                                >
                                    중복확인
                                </button>
                            </div>
                            {isVerified === true && (
                                <span className="verification-message success">
                                    사용가능
                                </span>
                            )}
                            {isVerified === false && (
                                <span className="verification-message failure">
                                    중복된 이메일입니다
                                </span>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="name">이름</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="input-group phone-input">
                            <label htmlFor="phone">전화번호</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="전화번호를 입력하세요"
                                required
                            />
                        </div>

                        <button type="submit" className="signup-button">
                            회원가입
                        </button>
                    </form>
                )}

                {!isSubmitted && (
                    <p className="login-link">
                        이미 계정이 있으신가요?{' '}
                        <Link to='/login'>
                            <span className="login-link-text">
                                로그인
                            </span>
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default SignUp;

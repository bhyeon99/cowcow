// src/oauth/KakaoCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = ({ setUser }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get('code');

        const fetchKakaoToken = async () => {
            try {
                const response = await fetch('https://kauth.kakao.com/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        client_id: '81c842986d27d47050e09dff84737fa7', // 클라이언트 ID
                        redirect_uri: 'http://223.130.160.153:3000/kakao-callback', // 발급받은 Redirect URI
                        code: code, // 인증 코드
                    }),
                });

                if (!response.ok) {
                    throw new Error('토큰 발급 실패');
                }

                const data = await response.json();
                console.log('Kakao Token:', data);

                const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${data.access_token}`,
                    },
                });

                if (!userInfoResponse.ok) {
                    throw new Error('사용자 정보 가져오기 실패');
                }

                const user = await userInfoResponse.json();
                console.log('Kakao User Info:', user);

                setUser(user); // 사용자 정보 저장
                localStorage.setItem('user', JSON.stringify(user)); // 로컬 스토리지 저장

                navigate('/'); // 메인 페이지로 이동
            } catch (error) {
                console.error('Error during Kakao login:', error);
                alert('카카오 로그인에 실패했습니다.');
                navigate('/login'); // 로그인 페이지로 이동
            }
        };

        if (code) fetchKakaoToken(); // 인증 코드가 있으면 토큰 요청
    }, [navigate, setUser]);

    return <p>카카오 로그인 처리 중...</p>;
};

export default KakaoCallback;

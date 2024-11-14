// src/login/Login.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // CSS 파일 import

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Kakao SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("af7925f0ef05c7ce4f1f5838b12c1e6e"); // 네이티브 앱 키 사용
      console.log("Kakao SDK 초기화 완료");
    }
  }, []);
  const handleKakaoLogin = () => {
    window.Kakao.Auth.loginForm({
      success: async (response) => {
        try {
          const kakaoResponse = await window.Kakao.API.request({
            url: "/v2/user/me",
          });

          const kakaoData = {
            kakaoId: kakaoResponse.id, // ID 필드 명확하게
            email: kakaoResponse.kakao_account?.email || "",
            nickname: kakaoResponse.properties?.nickname || "카카오 유저",
          };

          // 서버로 사용자 정보 전달
          const serverResponse = await fetch(
            "http://223.130.160.153:3001/users/kakao-login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(kakaoData),
            }
          );

          if (!serverResponse.ok) {
            throw new Error("카카오 로그인 실패");
          }

          const result = await serverResponse.json();

          if (!result || !result.usrSeq) {
            throw new Error("유효한 사용자 데이터가 없습니다.");
          }

          console.log("로그인된 사용자 정보:", result);

          setUser(result); // 사용자 상태 저장
          sessionStorage.setItem("user", JSON.stringify(result)); // 로컬 스토리지 저장
          navigate("/"); // 메인 페이지로 이동
        } catch (error) {
          console.error("Kakao login failed:", error);
          alert("카카오 로그인에 실패했습니다.");
        }
      },
      fail: (error) => {
        console.error("Kakao login failed:", error);
        alert("카카오 로그인 실패");
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { usrEml: email, usrPwd: password };

    try {
      const response = await fetch("http://223.130.160.153:3001/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }
      
      const result = await response.json();
      console.log("로그인 성공:", result);
      setUser(result);
      sessionStorage.setItem("user", JSON.stringify(result));
      navigate("/");
    } catch (error) {
      console.error("Error during login:", error);
      alert("로그인 실패: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
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
            />
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>

        <div className="social-login">
          <button onClick={handleKakaoLogin} className="kakao-login-button">
            카카오 로그인
          </button>
        </div>

        <div className="help-links">
          <a href="/find-id">아이디 찾기</a>
          <span> | </span>
          <a href="/find-password">비밀번호 찾기</a>
        </div>

        <p className="signup-link">
          계정이 없으신가요? <Link to="/signUp">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

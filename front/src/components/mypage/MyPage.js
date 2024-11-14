import React, { useState, useEffect } from 'react';
import './MyPage.css';
import Sidebar from './Sidebar';

const MyPage = ({ user, setUser }) => {
    const [showTopButton, setShowTopButton] = useState(false);
    const [barns, setBarns] = useState([]);

    useEffect(() => {
        const fetchUserBarn = async () => {
            try {
                const response = await fetch(`http://223.130.160.153:3001/user-barns/user/${user.usrSeq}`);
                if (!response.ok) {
                    throw new Error("농가 정보를 가져오는 데 실패했습니다.");
                }
                const userBarn = await response.json();
                console.log("Fetched barns:", userBarn);
                setBarns(userBarn);
            } catch (error) {
                console.error("Error fetching user-barns data", error);
            }
        };
        if (user?.usrSeq) fetchUserBarn();
    }, [user]);

    const handleScroll = () => {
        setShowTopButton(window.scrollY > 100);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="mypage-layout">
            <div className="content-container">
                <Sidebar />
                <section className="mypage-content">
                    <h1>개인정보 변경</h1>
                    <ProfileInfo user={user} userBarns={barns} setBarns={setBarns} setUser={setUser} />
                </section>
            </div>
            {showTopButton && (
                <button id="topButton" onClick={scrollToTop} title="맨 위로">
                    Top
                </button>
            )}
        </div>
    );
};



const ProfileInfo = ({ user, userBarns, setBarns, setUser }) => {
    const [newBarnName, setNewBarnName] = useState(''); // 새로운 농가 이름을 저장할 상태

    // 새로운 농가 추가
    const handleAddBarn = async () => {
        console.log("handleAddBarn의 newBarnName: ", newBarnName);

        if (newBarnName.trim() === '') {
            alert('농가 이름을 입력하세요.');
            return;
        }

        if (userBarns.length < 3) {
            try {
                const newBarn = { usrSeq: user.usrSeq, usrBarnName: newBarnName };
                const response = await fetch('http://223.130.160.153:3001/user-barns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBarn),
                });
                if (!response.ok) {
                    throw new Error('농가 추가에 실패했습니다.');
                }
                const createdBarn = await response.json();
                setBarns([...userBarns, createdBarn]); // 새로 추가된 농가를 barns 상태에 업데이트
                alert('농가가 성공적으로 추가되었습니다.');
                setNewBarnName(''); // 입력 필드를 초기화합니다.
            } catch (error) {
                console.error("Error adding new barn", error);
            }
        }
    };

    // 농가 삭제
    const handleRemoveBarn = async (id, index) => {
        const confirmed = window.confirm('삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            const response = await fetch(`http://223.130.160.153:3001/user-barns/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('농가 삭제에 실패했습니다.');
            }
            const updatedBarns = userBarns.filter((_, i) => i !== index);
            setBarns(updatedBarns);
            alert('농가가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error("Error removing barn", error);
        }
    };

    // 농가 이름 변경
    const handleChangeBarn = (index, value) => {
        const updatedBarns = [...userBarns];
        updatedBarns[index].usrBarnName = value;
        setBarns(updatedBarns);
    };

    console.log(user.usrSeq)

    return (
        <div className="profile-info">
            <InputField 
                label="이름" 
                value={user ? user.usrNm : '이름 없음'} 
                onChange={(newValue) => setUser({ ...user, usrNm: newValue })} 
                fieldName="usrNm"
                userId={user.usrSeq}
            />
            <InputField 
                label="이메일" 
                value={user ? user.usrEml : '이메일 없음'} 
                onChange={(newValue) => setUser({ ...user, usrEml: newValue })} 
                fieldName="usrEml"
                userId={user.usrSeq}
            />
            <InputField 
                label="전화번호" 
                value={user ? user.usrPhn : '전화번호 없음'} 
                onChange={(newValue) => setUser({ ...user, usrPhn: newValue })} 
                fieldName="usrPhn"
                userId={user.usrSeq}
            />

            <label className="address-label">농가이름</label>
            {userBarns.map((barn, index) => (
                <div key={index} className="address-group">
                    <input
                        type="text"
                        value={barn.usrBarnName || ''}
                        onChange={(e) => handleChangeBarn(index, e.target.value)}
                        placeholder="농가 이름을 입력하세요"
                    />
                    <button
                        className="btn remove-address"
                        onClick={() => handleRemoveBarn(barn.usrBarnSeq, index)}
                        disabled={userBarns.length === 0}
                    >
                        삭제
                    </button>
                </div>
            ))}

            {userBarns.length < 3 && (
                <div className="address-group">
                    <input
                        type="text"
                        value={newBarnName}
                        onChange={(e) => setNewBarnName(e.target.value)}
                        placeholder="새로운 농가 이름을 입력하세요"
                    />
                    <button
                        className="btn add-address"
                        onClick={handleAddBarn}
                    >
                        추가
                    </button>
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, value, onChange, fieldName, userId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [fieldValue, setFieldValue] = useState(value);

    const handleEditClick = () => {
        setIsEditing(true);
    };
    
    // console.log(usrSeq);

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`http://223.130.160.153:3001/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [fieldName]: fieldValue }),
            });

            if (!response.ok) {
                throw new Error('정보 업데이트에 실패했습니다.');
            }

            // 상태 업데이트 후 편집 모드 종료
            onChange(fieldValue);
            setIsEditing(false);
            alert(`${label}이(가) 성공적으로 업데이트되었습니다.`);
        } catch (error) {
            console.error("Error updating user information", error);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="input-wrapper">
                <input
                    type="text"
                    value={fieldValue}
                    readOnly={!isEditing}
                    onChange={(e) => setFieldValue(e.target.value)}
                />
                {!isEditing ? (
                    <button className="btn change-btn" onClick={handleEditClick}>
                        변경
                    </button>
                ) : (
                    <button className="btn save-btn" onClick={handleSaveClick}>
                        저장
                    </button>
                )}
            </div>
        </div>
    );

};

export default MyPage;




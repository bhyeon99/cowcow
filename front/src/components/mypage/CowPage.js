import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './CowPage.css';
import Sidebar from './Sidebar';


const CowPage = ({ user, setUser, isDarkMode }) => { // isDarkMode prop 추가
    const [formData, setFormData] = useState({
        cowNo: "",
        cowBirDt: "",
        usrSeq: user?.usrSeq || "",
        usrBarnSeq: "",
        cowRegion: "",
        cowKpn: "",
        cowPrt: "",
        cowGdr: "",
        cowJagigubun: "",
        cowEomigubun: "",
        notes: "",
        cowFamily: "",
        cowWeight: "",
    });

    const classifications = ["혈통우", "큰소"];
    const navigate = useNavigate();
    const [cows, setCows] = useState([]);
    const [userBarns, setUserBarn] = useState([]);
    const [filterDate, setFilterDate] = useState("");
    const [filtercowGdr, setFiltercowGdr] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [filterBarn, setFilterBarn] = useState();


    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = async (cowId) => {
        const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
        if (confirmDelete) {
            try {
                const response = await fetch(`http://223.130.160.153:3001/cows/${cowId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("삭제되었습니다.");
                    setCows((prevCows) => prevCows.filter((cow) => cow.cowSeq !== cowId));
                } else {
                    throw new Error("소 삭제에 실패했습니다.");
                }
            } catch (error) {
                console.error("Error deleting cow:", error);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "images") {
            const newImages = Array.from(files);
            if (formData.images.length + newImages.length > 4) {
                alert("최대 4개의 이미지만 업로드할 수 있습니다.");
                return;
            }
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...newImages],
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://223.130.160.153:3001/cows", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("소 등록이 완료되었습니다.");
                setFormData({
                    cowNo: "",
                    cowBirDt: "",
                    usrSeq: user.usrSeq,
                    usrBarnSeq: "",
                    cowRegion: "",
                    cowKpn: "",
                    cowPrt: "",
                    cowGdr: "",
                    cowJagigubun: "",
                    cowEomigubun: "",
                    notes: "",
                    cowFamily: "",
                    cowWeight: "",
                });
                navigate("/cowPage");
            } else {
                throw new Error("소 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error submitting cow data:", error);
        }
    };

    const filteredCows = cows.filter((cow) => {
        const matchesDate = filterDate ? cow.registrationDate === filterDate : true;
        const matchescowGdr = filtercowGdr ? cow.cowGdr === filtercowGdr : true;
        return matchesDate && matchescowGdr;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCows.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCows.length / itemsPerPage);

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        } else {
            navigate("/login");
        }
    }, [setUser, navigate]);

    useEffect(() => {
        if (user) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                usrSeq: user.usrSeq,
            }));
        }
    }, [user]);

    useEffect(() => {
        if (user?.usrSeq) {
            const fetchCows = async () => {
                try {
                    const response = await fetch(
                        `http://223.130.160.153:3001/cows/user/${user.usrSeq}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setCows(data);
                    } else {
                        throw new Error("소 데이터를 불러오지 못했습니다.");
                    }
                } catch (error) {
                    console.error("Error fetching cows:", error);
                }
            };
            fetchCows();
        }
    }, [user]);

    useEffect(() => {
        if (user?.usrSeq) {
            const fetchUserBarns = async () => {
                try {
                    const response = await fetch(
                        `http://223.130.160.153:3001/user-barns/user/${user.usrSeq}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setUserBarn(data);
                    } else {
                        throw new Error("농장 데이터를 불러오는 데 실패했습니다.");
                    }
                } catch (error) {
                    console.error("Error fetching user barns:", error);
                    setUserBarn([]);
                }
            };
            fetchUserBarns();
        }
    }, [user]);

    return (
        <div className={`layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="content-container">
                <Sidebar /> {/* 사이드바 컴포넌트 사용 */}
                <main className="content-main">
          {/* 등록 폼 */}
          <form className="registration-form" onSubmit={handleSubmit}>
            <label htmlFor="cowNo">개체번호</label>
            <input
              type="text"
              id="cowNo"
              name="cowNo"
              value={formData.cowNo}
              onChange={handleChange}
              required
            />
            <label htmlFor="cowBirDt">출생일</label>
            <input
              type="date"
              id="cowBirDt"
              name="cowBirDt"
              min="0"
              value={formData.cowBirDt}
              onChange={handleChange}
              required
            />
            <label htmlFor="usrNm">출하주</label>
            <input type="text" value={user?.usrNm || ""} readOnly />
            <label htmlFor="cowRegion">지역</label>
            <input
              type="text"
              id="cowRegion"
              name="cowRegion"
              value={formData.cowRegion}
              onChange={handleChange}
              required
            />
            <label htmlFor="usrBarnSeq">농가</label>
            <select
              id="usrBarnSeq"
              name="usrBarnSeq"
              value={formData.usrBarnSeq}
              onChange={handleChange}
              required
            >
              <option value="">농가 선택</option>
              {userBarns.length > 0 ? (
                userBarns.map((userBarn) => (
                  <option key={userBarn.usrBarnSeq} value={userBarn.usrBarnSeq}>
                    {userBarn.usrBarnName}
                  </option>
                ))
              ) : (
                <option disabled>농가가 없습니다</option>
              )}
            </select>
            <label htmlFor="cowKpn">KPN</label>
            <input
              type="text"
              id="cowKpn"
              name="cowKpn"
              value={formData.cowKpn}
              onChange={handleChange}
            />
            <label htmlFor="cowPrt">산차</label>
            <input
              type="number"
              id="cowPrt"
              name="cowPrt"
              value={formData.cowPrt}
              onChange={handleChange}
              min="1"
            />
            <label htmlFor="cowGdr">성별</label>
            <select
              id="cowGdr"
              name="cowGdr"
              value={formData.cowGdr}
              onChange={handleChange}
              required
            >
              <option value="">선택</option>
              <option value="수">수컷</option>
              <option value="암">암컷</option>
              <option value="프">프리미엄</option>
            </select>
            <label htmlFor="cowJagigubun">자기구분</label>
            <select
              id="cowJagigubun"
              name="cowJagigubun"
              value={formData.cowJagigubun}
              onChange={handleChange}
            >
              <option value="">선택</option>
              {classifications.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label htmlFor="cowEomigubun">어미구분</label>
            <select
              id="cowEomigubun"
              name="cowEomigubun"
              value={formData.cowEomigubun}
              onChange={handleChange}
            >
              <option value="">선택</option>
              {classifications.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label htmlFor="cowPrt">계대</label>
            <input
              type="text"
              id="cowFamily"
              name="cowFamily"
              value={formData.cowFamily}
              onChange={handleChange}
              min="0"
            />

            <label htmlFor="cowPrt">중량</label>
            <input
              type="number"
              id="cowWeight"
              name="cowWeight"
              value={formData.cowWeight}
              onChange={handleChange}
              min="100"
            />

            <label htmlFor="notes">비고</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />

            <button type="submit" className="submit-button">
              등록
            </button>
          </form>

          <div className="table-container">
            <h2>등록내역</h2>
            <div className="filter-section">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <select
                value={filtercowGdr}
                onChange={(e) => setFiltercowGdr(e.target.value)}
              >
                <option value="">성별 선택</option>
                <option value="수">수컷</option>
                <option value="암">암컷</option>
                <option value="프">프리미엄</option>
              </select>
              <select
                value={filterBarn}
                onChange={(e) => setFilterBarn(e.target.value)}
              >
                <option value="">농가 선택</option>
                {userBarns.map((barn) => (
                  <option key={barn.usrBarnSeq} value={barn.usrBarnSeq}>
                    {barn.usrBarnName}
                  </option>
                ))}
              </select>
            </div>

            <table className="registered-cows">
              <thead>
                <tr>
                  <th>개체번호</th>
                  <th>출생일</th>
                  <th>성별</th>
                  <th>KPN</th>
                  <th>산차</th>
                  <th>지역</th>
                  <th>농가</th>
                  <th>비고</th>
                  <th>계대</th>
                  <th>중량</th>
                  <th>-</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((cow) => (
                  <tr key={cow.cowSeq}>
                    <td>{cow.cowNo}</td>
                    <td>{cow.cowBirDt}</td>
                    <td>{cow.cowGdr}</td>
                    <td>{cow.cowKpn}</td>
                    <td>{cow.cowPrt}</td>
                    <td>{cow.cowRegion}</td>
                    <td>
                      {userBarns.find(
                        (barn) => barn.usrBarnSeq === cow.usrBarnSeq
                      )?.usrBarnName || "정보 없음"}
                    </td>
                    <td>{cow.notes}</td>
                    <td>{cow.cowFamily}</td>
                    <td>{cow.cowWeight}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(cow.cowSeq)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-button ${
                    i + 1 === currentPage ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CowPage;

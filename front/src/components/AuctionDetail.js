import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AuctionDetail.css";
import cow1 from '../images/cowImg1 (2).png'
import cow2 from '../images/cowImg2 (2).png'

const AuctionDetail = ({ user }) => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [acows, setAcows] = useState([]);
  const [endTime, setEndTime] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [highestBid, setHighestBid] = useState(null);
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [displayAmount, setDisplayAmount] = useState('0만원');
  const [acowData, setAcowData] = useState(null);
  const navigate = useNavigate();

  const imgSlides = [
    { src: "/images/소1.jfif", alt: "경매 소 이미지 1" },
    { src: "/images/소2.jfif", alt: "경매 소 이미지 2" },
    { src: "/images/소3.jfif", alt: "경매 소 이미지 3" },
    { src: "/images/소4.jfif", alt: "경매 소 이미지 4" },
  ];

  const showSlide = (index) => {
    const newIndex = (index + acows.length) % acows.length;
    setCurrentSlide(newIndex);
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  const fetchAuctionDetail = async () => {
    try {
      const response = await fetch(`http://223.130.160.153:3001/auctions/${id}`);
      if (!response.ok) {
        throw new Error("경매 정보를 가져오는 데 실패했습니다.");
      }
      const auctionData = await response.json();
      setAuction(auctionData);
      setAcows(auctionData.auctionCows);
      setEndTime(new Date(auctionData.aucEndDt));
    } catch (error) {
      console.error("Error fetching auction detail:", error);
    }
  };

  const updateTimer = () => {
    const now = new Date();
    const distance = endTime - now;

    if (distance <= 0) {
      setDays("00");
      setHours("00");
      setMinutes("00");
      setSeconds("00");
      return;
    }

    setDays(String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'));
    setHours(String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'));
    setMinutes(String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'));
    setSeconds(String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0'));
  };

  useEffect(() => {
    fetchAuctionDetail();
  }, [id]);

  useEffect(() => {
    if (!endTime) return;

    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [endTime]);

  const fetchHighestBid = async (acowSeq) => {
    try {
      const response = await fetch(
        `http://223.130.160.153:3001/auction-bids/highest/${acowSeq}`
      );
      if (!response.ok) {
        throw new Error("최고 입찰가를 가져오는 데 실패했습니다.");
      }
      const bidData = await response.json();
      setHighestBid(bidData);
    } catch (error) {
      console.error("Error fetching highest bid:", error);
      setHighestBid(null);
    }
  };

  const fetchAcowStatus = async (acowSeq) => {
    try {
      const response = await fetch(
        `http://223.130.160.153:3001/auction-cows/${acowSeq}`
      );
      if (!response.ok) {
        throw new Error("해당하는 소의 정보를 가져오는 데 실패했습니다.");
      }
      const acowData = await response.json();
      setAcowData(acowData);
    } catch (error) {
      console.error("Error fetching acow Status:", error);
      setAcowData(null);
    }
  };

  useEffect(() => {
    if (!acows[currentSlide]) return;

    const acowStatusInterval = setInterval(() => {
      fetchAcowStatus(acows[currentSlide].acowSeq);
    }, 500);

    return () => clearInterval(acowStatusInterval);
  }, [currentSlide, acows]);


  useEffect(() => {
    if (!acows[currentSlide]) return;

    const highestBidInterval = setInterval(() => {
      fetchHighestBid(acows[currentSlide].acowSeq);
    }, 1000);

    return () => clearInterval(highestBidInterval);
  }, [currentSlide, acows]);

  // 금액을 한글 형식으로 변환하는 함수
  const formatAmount = (amount) => {
    if (amount < 10000) {
      return `${amount}만원`;
    } else {
      const billions = Math.floor(amount / 10000); // 억 단위
      const tenThousands = amount % 10000; // 만원 단위

      if (tenThousands === 0) {
        return `${billions}억`;
      } else {
        return `${billions}억 ${tenThousands}만원`;
      }
    }
  };


  const handleBidSubmit = async () => {
    if (!bidAmount) {
      alert("입찰 금액을 입력해 주세요.");
      return;
    } else if (bidAmount <= acows[currentSlide].acowBottomPrice) {
      alert("입찰 금액은 최저가보다 높아야 합니다.");
      return;
    } else if (highestBid && bidAmount <= highestBid.bidAmt) {
      alert("입찰 금액은 현재 최고입찰가보다 높아야 합니다.");
      return;
    }

    try {
      const response = await fetch(`http://223.130.160.153:3001/auction-bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aucSeq: auction.aucSeq,
          acowSeq: acows[currentSlide].acowSeq,
          bidAcc: user.usrSeq,
          bidAmt: parseInt(bidAmount, 10),
          bidDt: new Date().toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("입찰에 실패했습니다.");
      }

      alert("입찰에 성공했습니다!");
      setBidAmount("");
      setDisplayAmount("0만원");
    } catch (error) {
      console.error("Error during bid submission:", error);
      alert("입찰에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleWinningBid = async () => {
    if (!highestBid) {
      alert("낙찰할 입찰가가 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://223.130.160.153:3001/auction-cows/${acows[currentSlide].acowSeq}/win`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            acowWinnerSeq: highestBid.bidAcc,
            acowFinalBid: highestBid.bidAmt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("낙찰 처리에 실패했습니다.");
      }

      alert("낙찰이 성공적으로 처리되었습니다!");
    } catch (error) {
      console.error("Error during winning bid submission:", error);
      alert("낙찰 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleBroadcastEnd = async () => {
    try {
      const response = await fetch(`http://223.130.160.153:3001/auctions/${auction.aucSeq}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aucStatus: "방송종료" }),
      });
      if (!response.ok) throw new Error("경매 종료 상태 변경 실패");
    } catch (error) {
      console.error("Error updating auction status:", error);
    }
    alert("방송이 종료되었습니다.");
    navigate("/");
  };

  if (!auction) return <p>경매 정보를 불러오는 중...</p>;

  const slides =
    acows?.map((acow) => (
      <table className="details-table" key={acow.acowSeq}>
        <tbody>
          <tr>
            <th>방송 제목</th>
            <td>{auction?.aucBroadcastTitle || "정보 없음"}</td>
          </tr>
          <tr>
            <th>개체 번호</th>
            <td>{acow?.cow?.cowNo || "정보 없음"}</td>
          </tr>
          <tr>
            <th>출하주</th>
            <td>{auction?.user?.usrNm || "정보 없음"}</td>
          </tr>
          <tr>
            <th>농장 이름</th>
            <td>{acow?.cow?.userBarn?.usrBarnName || "정보 없음"}</td>
          </tr>
          <tr>
            <th>성별</th>
            <td>{acow?.cow?.cowGdr || "정보 없음"}</td>
          </tr>
          <tr>
            <th>최저가</th>
            <td>{acow?.acowBottomPrice || 0}만원</td>
          </tr>
          <tr>
            <th>현재 최고 입찰가(입찰자)</th>
            <td>
              {highestBid
                ? `${highestBid.bidAmt}만원(${highestBid.user.usrNm})`
                : "정보 없음"}
            </td>
          </tr>
          <tr>
            <th>
              <h1>경매 상태</h1>
            </th>
            <td>
              <h1
                className={
                  acowData?.acowStatus === "진행중"
                    ? "state-progressing"
                    : "state-won"
                }
              >
                {acowData?.acowStatus || "정보 없음"}
              </h1>
            </td>
          </tr>
        </tbody>
      </table>
    )) || [];

  return (
    <div className="auction-detail-container">
      <section className="auction-detail">
        <div className="expected-price-container">
          <div className="timer-container">
            <div>
              <div className="ending-text">마감까지 </div>
            </div>
            <div className="timer-unit">
              <div className="number">{days}일</div>
            </div>
            <div className="timer-unit">
              <div className="number">{hours}시</div>
            </div>
            <div className="timer-unit">
              <div className="number">{minutes}분</div>
            </div>
            <div className="timer-unit">
              <div className="number">{seconds}초</div>
            </div>
            <div className="ending-text">남았습니다!</div>
          </div>
        </div>
        <div className="auction-content">
          <div className="video-container">
            <iframe
              src="http://223.130.160.153:5000/video_feed"
              title="RTSP Video Stream"
            ></iframe>
          </div>

          <div className="auction-details">
            <div className="details-table">
              <div className="slider">
                <div key={currentSlide} className="slide">
                  {slides[currentSlide]}
                </div>
              </div>
            </div>

              {!user ? (
              <>
                <div className="bid-section-inline">
                  <input
                        type="number"
                        placeholder={
                          acowData?.acowStatus === "낙찰"
                            ? "낙찰 완료된 상품입니다"
                            : "입찰 금액 입력 (단위: 만원)"
                        }
                        className="bid-input"
                        value={bidAmount}
                        onChange={(e) => {
                          const inputAmount = e.target.value;

                          if (inputAmount === "") {
                            setBidAmount("");
                            setDisplayAmount("0만원");
                            return;
                          }

                          const amountInTenThousands = parseInt(inputAmount, 10);

                          if (!isNaN(amountInTenThousands)) {
                            if (amountInTenThousands > 100000) {
                              alert("입력 가능한 최대 금액은 10억 원입니다.");
                              return;
                            }

                            setBidAmount(amountInTenThousands);
                            setDisplayAmount(formatAmount(amountInTenThousands));
                          }
                        }}
                        disabled={acowData?.acowStatus === "낙찰"}
                      />
                    <div className="display-amount">입력 금액: {displayAmount}</div>
                    </div>
                    <div className="bid-section-inline">
                    {/* <Link to="/login"> */}
                      <button
                        className={`success-bid ${acowData?.acowStatus === "낙찰" ? "disabled" : ""}`}
                        disabled={acowData?.acowStatus === "낙찰"}
                        onClick={() => navigate('/login')} // 함수 없이 바로 경로 이동
                      >
                        {acowData?.acowStatus === "낙찰"
                          ? "입찰 불가"
                          : "입찰하기"}
                        </button>
                    {/* </Link> */}
                </div>
              </>
              ) : (
                <>
                {auction.usrSeq === user.usrSeq ? (
                    <div className="bid-section-inline">
                      <button
                        className={`btn primary ${acows[currentSlide]?.acowStatus === "낙찰"
                            ? "disabled"
                            : ""
                          }`}
                        onClick={handleWinningBid}
                        disabled={
                          !highestBid ||
                          acowData?.acowStatus === "낙찰"
                        }
                      >
                        {acowData?.acowStatus === "낙찰"
                          ? "낙찰 완료"
                          : "낙찰하기"}
                      </button>
                      <button
                        className='btn primary2'
                        onClick={handleBroadcastEnd}
                      >
                        방송 종료
                      </button>
                    </div>
                  ) : (
                    <>
                    <div className="bid-section-inline">
                      <input
                        type="number"
                        placeholder={
                          acowData?.acowStatus === "낙찰"
                            ? "낙찰 완료된 상품입니다"
                            : "입찰 금액 입력 (단위: 만원)"
                        }
                        className="bid-input"
                        value={bidAmount}
                        onChange={(e) => {
                          const inputAmount = e.target.value;

                          if (inputAmount === "") {
                            setBidAmount("");
                            setDisplayAmount("0만원");
                            return;
                          }

                          const amountInTenThousands = parseInt(inputAmount, 10);

                          if (!isNaN(amountInTenThousands)) {
                            if (amountInTenThousands > 100000) {
                              alert("입력 가능한 최대 금액은 10억 원입니다.");
                              return;
                            }

                            setBidAmount(amountInTenThousands);
                            setDisplayAmount(formatAmount(amountInTenThousands));
                          }
                        }}
                        disabled={acowData?.acowStatus === "낙찰"}
                      />
                      <div className="display-amount">입력 금액: {displayAmount}</div>
                      </div>
                      <div className="bid-section-inline">
                      <button
                        className={`success-bid ${acowData?.acowStatus === "낙찰"
                            ? "disabled"
                            : ""
                          }`}
                        onClick={handleBidSubmit}
                        disabled={acowData?.acowStatus === "낙찰"}
                      >
                        {acowData?.acowStatus === "낙찰"
                          ? "입찰 불가"
                          : "입찰하기"}
                      </button>
                    </div>
                    </>
                  )}
                </>
              )}
          </div>
        </div>

        <div className="expected-price">
          예상가 : {acows[currentSlide]?.acowPredictPrice || 0}만원
        </div>

        <div className="slider-container">
          <div
            className="slider"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="slide">
                <img src={cow1} alt={slide.alt} />
                <img src={cow2} alt={slide.alt} />
              </div>
            ))}
          </div>
          <button className="prev" onClick={prevSlide}>
            &#10094;
          </button>
          <button className="next" onClick={nextSlide}>
            &#10095;
          </button>
        </div>
      </section>
    </div>
  );
};

export default AuctionDetail;

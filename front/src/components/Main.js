import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Main.css"; // CSS 파일 불러오기
import thumbnail1 from "../images/thumbnail1.png";
import thumbnail2 from "../images/thumbnail2.png";
import thumbnail3 from "../images/thumbnail3.png";
import thumbnail4 from "../images/thumbnail4.png";
import thumbnail5 from "../images/thumbnail5.png";
import thumbnail6 from "../images/thumbnail6.png";
import thumbnail7 from "../images/thumbnail7.png";

const MainPage = ({ searchTerm, setSearchTerm, isDarkMode, toggleTheme }) => {
  const [auctionData, setAuctionData] = useState([]);
  const [showTopButton, setShowTopButton] = useState(false);
  const [randomThumbnail, setRandomThumbnail] = useState([]);

  // Array of all thumbnails
  const thumbnails = [
    thumbnail1,
    thumbnail2,
    thumbnail3,
    thumbnail4,
    thumbnail5,
    thumbnail6,
    thumbnail7,
  ];

  // Function to get random thumbnails
  const getRandomThumbnails = () => {
    return auctionData.map(() => {
      const randomIndex = Math.floor(Math.random() * thumbnails.length);
      return thumbnails[randomIndex];
    });
  };

  useEffect(() => {
    setRandomThumbnail(getRandomThumbnails());
  }, [auctionData]);

  const filteredAuctions = auctionData.filter((auction) =>
    auction.aucBroadcastTitle.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((auction) =>
    (auction.aucStatus === "진행중" || auction.aucStatus === "종료")
  );

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch("http://223.130.160.153:3001/auctions");
        if (!response.ok) {
          throw new Error("Failed to fetch auctions.");
        }
        const data = await response.json();
        setAuctionData(data);
      } catch (error) {
        console.error("Error fetching auction data:", error);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    let today = new Date();
    let timestamp = today.toISOString();

    auctionData.forEach((auction) => {
      if (auction.aucStatus === '진행중' && auction.auctionCows.every((cow) => cow.acowStatus === '낙찰')) {
        handleAuctionEnd(auction.aucSeq);
      } else if (auction.aucStatus !== "방송종료") {
        if (auction.aucEndDt <= timestamp) {
          handleAuctionStop(auction.aucSeq);
        }
      }
    });
  }, [auctionData]);

  const handleAuctionEnd = async (auctionId) => {
    try {
      const response = await fetch(`http://223.130.160.153:3001/auctions/${auctionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aucStatus: '종료' }),
      });

      if (!response.ok) {
        throw new Error('경매 상태 업데이트에 실패했습니다.');
      }

      setAuctionData((prevData) =>
        prevData.map((auction) =>
          auction.aucSeq === auctionId ? { ...auction, aucStatus: '종료' } : auction
        )
      );
    } catch (error) {
      console.error('Error updating auction status:', error);
    }
  };

  // 경매 상태를 '방송종료'로 변경하는 함수
  const handleAuctionStop = async (auctionId) => {
    try {
      const response = await fetch(`http://223.130.160.153:3001/auctions/${auctionId}/status`, {
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
  };


  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="경매 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 검색 결과 렌더링 */}
      <div className="search-results">
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map((auction) => (
            <div key={auction.id} className="auction-item">
              <h3>{auction.title}</h3>
              <p>{auction.description}</p>
            </div>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </div>

      <div className="live-auctions">
        <div className="auction-list">
          {filteredAuctions.map((auction, index) => (
            <Link to={`/auctionDetail/${auction.aucSeq}`} key={auction.aucSeq}>
              <div className={`auction-card ${auction.aucStatus.toLowerCase()}`}>
                <div className="thumbnail-container">
                  <img
                    src={randomThumbnail[index]}
                    alt={`Thumbnail of ${auction.aucBroadcastTitle}`}
                  />
                  {auction.aucStatus === "진행중" && (
                    <div className="live-badge">LIVE</div>
                  )}
                  <div className="viewer-count">
                    {Math.floor(Math.random() * 200)}명
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`auction-info ${isDarkMode ? "dark" : "light"}`}>{auction.aucBroadcastTitle}</h3>
                <p className={`auction-info ${isDarkMode ? "dark" : "light"}`}>경매 상태: {auction.aucStatus}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <button
        className={`theme-toggle-button ${isDarkMode ? "dark" : "light"}`}
        onClick={toggleTheme}
      >
        {isDarkMode ? "🌞" : "🌙"}
      </button>
    </div>
  );
};

export default MainPage;

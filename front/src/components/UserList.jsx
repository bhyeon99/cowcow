import React from 'react';

const UserList = ({ users }) => {
  return (
    <div>
      <h1>사용자 목록</h1>
      <ul>
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <li key={user.usrSeq}>
              {user.usrNm} ({user.usrAcc})
            </li>
          ))
        ) : (
          <li>사용자가 없습니다.</li>
        )}
      </ul>
    </div>
  );
};

export default UserList;

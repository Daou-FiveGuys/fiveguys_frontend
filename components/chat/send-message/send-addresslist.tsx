import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const SendAddressList: React.FC = () => {
  const selectedContacts = useSelector((state: RootState) => state.contact2.selectedContacts);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">선택된 연락처 목록</h2>
      {selectedContacts.length === 0 ? (
        <p>선택된 연락처가 없습니다.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {selectedContacts.map((contact, index) => (
              <li key={index} className="p-2 border rounded">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-500">{contact.tel}</div>
                <div className="text-sm text-gray-400">{contact.groupName}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="text-xl font-bold mb-4 text-center">
              이제 전화번호를 입력해주세요!
            </div>
          </div>
        </> 
      )}
    </div>
  );
};

export default SendAddressList;


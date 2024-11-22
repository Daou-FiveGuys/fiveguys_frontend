import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDispatch } from 'react-redux';
import { setSelectedContacts, Contact } from '@/redux/slices/contactsSlice';
import { Dispatch, AnyAction } from 'redux';
import SendAddressList from './send-addresslist';

const sampleData: Contact[] = [
  { name: "김철수", tel: "010-1234-5678", groupName: 1 },
  { name: "이영희", tel: "010-2345-6789", groupName: 2 },
  { name: "박민수", tel: "010-3456-7890", groupName: 3 },
  { name: "정미영", tel: "010-4567-8901", groupName: 4 },
  { name: "홍길동", tel: "010-5678-9012", groupName: 5 },
  { name: "최지원", tel: "010-6789-0123", groupName: 2 },
  { name: "강민준", tel: "010-7890-1234", groupName: 2 },
];

export default function SendMessagePanel() {
  const [selectedContactNames, setSelectedContactNames] = useState<string[]>([]);
  const [lastClickedGroup, setLastClickedGroup] = useState<number | null>(null);
  const dispatch: Dispatch<AnyAction> = useDispatch();

  const toggleContact = (name: string, groupName: number) => {
    const groupContactNames = sampleData
      .filter(contact => contact.groupName === groupName)
      .map(contact => contact.name);
    
    setSelectedContactNames(prev => {
      if (prev.length > 0 && !prev.includes(name)) {
        return groupContactNames;
      } else if (prev.includes(name)) {
        return prev.filter(contactName => !groupContactNames.includes(contactName));
      } else {
        return [...prev, ...groupContactNames.filter(gName => !prev.includes(gName))];
      }
    });
  };

  const toggleGroup = (groupName: number) => {
    const groupContactNames = sampleData
      .filter(contact => contact.groupName === groupName)
      .map(contact => contact.name);
    
    setSelectedContactNames(prev => {
      if (lastClickedGroup === groupName && prev.length === groupContactNames.length) {
        return [];
      } else if (prev.length > 0 && !groupContactNames.every(name => prev.includes(name))) {
        return groupContactNames;
      } else {
        return [...prev, ...groupContactNames.filter(name => !prev.includes(name))];
      }
    });
    setLastClickedGroup(groupName);
  };

  const handleConfirm = () => {
    const selectedContactsData = sampleData.filter(contact => selectedContactNames.includes(contact.name));
    dispatch(setSelectedContacts(selectedContactsData));
    console.log("선택된 연락처:", selectedContactsData);
  };

  return (
    <div>
      <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md mb-4">
        <h2 className="text-xl font-bold mb-4">메시지 보내기</h2>
        <div className="space-y-2 mb-4">
          {sampleData.map(contact => (
            <div key={`${contact.name}-${contact.tel}`} className="flex items-center p-2 rounded hover:bg-gray-100">
              <input
                type="checkbox"
                id={`contact-${contact.name}`}
                checked={selectedContactNames.includes(contact.name)}
                onChange={() => toggleContact(contact.name, contact.groupName)}
                className="sr-only peer"
              />
              <label
                htmlFor={`contact-${contact.name}`}
                className="flex-grow cursor-pointer peer-checked:font-bold"
              >
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-500">{contact.tel}</div>
              </label>
              <button
                onClick={() => toggleGroup(contact.groupName)}
                className={`text-sm text-gray-400 hover:underline focus:outline-none ${selectedContactNames.includes(contact.name) ? 'font-bold' : ''}`}
              >
                {contact.groupName}
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={selectedContactNames.length === 0}
          >
            확인
          </Button>
        </div>
      </div>
      <SendAddressList />
    </div>
  );
}


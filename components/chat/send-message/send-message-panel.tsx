import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const dispatch: Dispatch<AnyAction> = useDispatch();

  const groupedContacts = sampleData.reduce((acc, contact) => {
    if (!acc[contact.groupName]) {
      acc[contact.groupName] = [];
    }
    acc[contact.groupName].push(contact);
    return acc;
  }, {} as Record<number, Contact[]>);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const toggleGroup = (groupName: number) => {
    setSelectedGroup(prevGroup => prevGroup === groupName ? null : groupName);
  };

  const handleConfirm = () => {
    if (activeTab === "all" && selectedContact) {
      dispatch(setSelectedContacts([selectedContact]));
      console.log("선택된 연락처:", selectedContact);
    } else if (activeTab === "groups" && selectedGroup !== null) {
      const selectedContactsData = groupedContacts[selectedGroup] || [];
      dispatch(setSelectedContacts(selectedContactsData));
      console.log("선택된 그룹의 연락처:", selectedContactsData);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">메시지 보내기</h2>
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">전체 연락처</TabsTrigger>
          <TabsTrigger value="groups">그룹별 연락처</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-2 mb-4">
            {sampleData.map(contact => (
              <div 
                key={`${contact.name}-${contact.tel}`} 
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedContact === contact ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="flex-grow">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-500">{contact.tel}</div>
                </div>
                <div className="text-sm text-gray-400">그룹 {contact.groupName}</div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="groups">
          <div className="space-y-4 mb-4">
            {Object.entries(groupedContacts).map(([groupId, contacts]) => (
              <div key={groupId} className="border rounded p-2">
                <button
                  onClick={() => toggleGroup(Number(groupId))}
                  className={`w-full text-left font-medium p-2 rounded ${
                    selectedGroup === Number(groupId) ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  그룹 {groupId} ({contacts.length})
                </button>
                {selectedGroup === Number(groupId) && (
                  <div className="mt-2 space-y-2">
                    {contacts.map(contact => (
                      <div key={contact.name} className="ml-4 text-sm">
                        <div>{contact.name}</div>
                        <div className="text-gray-500">{contact.tel}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button
          onClick={handleConfirm}
          disabled={(activeTab === "all" && !selectedContact) || (activeTab === "groups" && selectedGroup === null)}
        >
          확인
        </Button>
      </div>
      <SendAddressList />
    </div>
  );
}


'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'
import { Contact2 } from '../entity'
import { api, Target } from './service'

export default function AddressBookModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact2[]>([])

  const handleClose = () => setIsModalOpen(false)

  /**
   * 1. 추가
   * 2. 수정
   * 3. 삭제
   * 4. 전체 삭제
   */
  const handleSelectContacts = (type: number, contact2: Contact2) => {
    setSelectedContacts(prevContacts => {
      let contacts = [...prevContacts]
      switch(type) {
        case 1:
          if (!contacts.some(contact => contact.contactId === contact2.contactId)) {
            contacts.push(contact2)
          }
          break
        case 2:
          contacts = contacts.map(contact =>
            contact.contactId === contact2.contactId ? contact2 : contact)
          break
        case 3:
          contacts = contacts.filter(contact => contact.contactId !== contact2.contactId)
          break
        case 4:
          contacts = []
          break
      }
      return contacts
    })
  }

  // ※ 임시코드!!!! 모달 적용하는 사람은 해당 정보 삭제할 것
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="p-8">
      {/* ※ 임시코드!!!! 모달 적용하는 사람은 해당 정보 삭제할 것 */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="전송하는 사람의 전화번호"
        className="border border-gray-300 rounded-lg p-2 w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />


      {/* Trigger Button */}
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        주소록 열기
      </Button>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-[95vw] md:max-w-[1000px] z-50"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent background click propagation
        >
          {/* AddressBook Component */}
          <div className="mt-4">
            <AddressBook onSelectContacts={handleSelectContacts} />
          </div>
          
          {/* Send Button */}
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => {
                const targets: Target[] = selectedContacts.map(contact => ({
                  toNumber: contact.telNum,
                  changeWord: {
                    var1: contact.one || '',
                    var2: contact.two || '',
                    var3: contact.three || '',
                    var4: contact.four || '',
                    var5: contact.var5 || '',
                    var6: contact.var6 || '',
                    var7: contact.var7 || '',
                    var8: contact.var8 || '',
                  },
                  name: contact.name
                }));
                console.log('Sending:', targets);

                // TODO: API 구체화
                // 1. messageType 설정하기 (조건문으로 구분가능 (1) 길이 (2) 이미지 파일 유무)
                const messageType = "SMS" // SMS, MMS, LMS 존재

                // 2. 전송 전화번호 설정 (유저에 본인 전화번호 있을 줄 알았는데, 없음)
                // const fromNumber = "01000000000"
                const fromNumber = inputValue

                // 3. 제목 전송 받기
                const subject = "전송할 제목입니다." // LMS와 MMS에만 필요
                
                // 4. 본문 전송 받기
                // ※ 본문 길이 예외처리 할 것
                const content = "안녕하세요 테스트중입니다."

                // 5. 파일 바이너리 데이터 전송 받기, 파일 이름은 DateTime으로 할 듯
                // ※ 파일 길이 예외처리 할 것
                const fileData = "" // 파일 바이너리 데이터

                api.sendMessage({
                  "messageType": messageType,
                  "content": content,
                  "fromNumber": fromNumber,
                  "targets": targets,
                  "subject": subject,
                  "files": {
                    "name": `image_${new Date().toLocaleDateString()}`,
                    "size": fileData.length,
                    "data": fileData
                  }
                })

                handleClose();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              전송하기 ({selectedContacts.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
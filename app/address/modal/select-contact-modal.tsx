'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'
import { Contact2 } from '../entity'

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

  return (
    <div className="p-8">
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
                console.log('Sending:', selectedContacts)
                handleClose()
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
};
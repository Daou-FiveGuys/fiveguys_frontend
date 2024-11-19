'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'
import { Contact2 } from '../entity'

export type Target = {
  to: string,
  changeWord: ChangeWord,
  name: string
}

export type ChangeWord = {
  var1: string,
  var2: string,
  var3: string,
  var4: string,
  var5: string,
  var6: string,
  var7: string
}

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
                const targets: Target[] = selectedContacts.map(contact => ({
                  to: contact.telNum,
                  changeWord: {
                    var1: contact.var1 || '',
                    var2: contact.var2 || '',
                    var3: contact.var3 || '',
                    var4: contact.var4 || '',
                    var5: contact.var5 || '',
                    var6: contact.var6 || '',
                    var7: contact.var7 || ''
                  },
                  name: contact.name
                }));
                console.log('Sending:', targets);
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
'use client'

import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'
import { useState } from 'react'
import { Contact2 } from '../entity'

export default function AddressBookModal() {
  const [selectedContacts, setSelectedContacts] = useState<Contact2[]>([])

  /**
   * 1. 추가
   * 2. 수정
   * 3. 삭제
   */
  const handleSelectContacts = (type:number, contact2:Contact2) => {
    var contacts = selectedContacts
    switch(type) {
      case 1:
        const contactExists = contacts.some(contact => contact.contactId === contact2?.contactId);
        if (!contactExists) {
          contacts = [...contacts, contact2!]
        }
        break;
      case 2:
        contacts = contacts.map(contact =>
          contact.contactId === contact2?.contactId ? contact = contact2 : contact)
        break;
      case 3:
        contacts = contacts.filter(contact => contact.contactId !== contact2?.contactId);
        break;
      case 4:
        contacts = []
      default:
        break;
    }
    setSelectedContacts(contacts)
  }  

  return (
    <div>
      <AddressBook onSelectContacts={handleSelectContacts} />
      <div className="mt-4">
        <Button onClick={() => console.log('Sending:', selectedContacts)}>
          전송하기 ({selectedContacts.length})
        </Button>
      </div>
    </div>
  )
}
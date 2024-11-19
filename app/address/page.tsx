import AddressBook from './address-book'
import { Contact2 } from './entity'
import TopNav from './top-nav'

export default function Home() {
  /**
   * 1. 추가
   * 2. 수정
   * 3. 삭제
   * 4. 전체 삭제
   */
  const handleSelectContacts = (type: number, contact2: Contact2) => {
  }

    return (
        <main className="container mx-auto p-4">
            <TopNav/>
            <AddressBook onSelectContacts={handleSelectContacts}/>
        </main>
    )
}
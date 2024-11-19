import AddressBook from '../address-book'
import Excel from './excel'
import AddressBookModal from '../select-contact-modal'

export default function Home() {
    return (
        <main className="container mx-auto p-4">
            <AddressBook />
            <Excel />
            <AddressBookModal/>
        </main>
    )
}
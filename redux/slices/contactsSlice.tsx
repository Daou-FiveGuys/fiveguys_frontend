import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Contact {
  name: string;
  tel: string;
  groupName: number;
  changeWorld?: ChangeWorld;
}
interface ChangeWorld{
  one?: string;
  two?: string;
  three?: string;
  four?: string;
  five?: string;
  six?: string;
  seven?: string;
  eight?: string;
}

interface ContactsState {
  contacts: Contact[];
  selectedContacts: Contact[];
}

const initialState: ContactsState = {
  contacts: [],
  selectedContacts: [],
};

// Add this helper function to provide default values
const createContact = (contact: Partial<Contact>): Contact => ({
  name: '',
  tel: '',
  groupName: 0,
  ...contact
});

export const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    addContact: (state, action: PayloadAction<Partial<Contact>>) => {
      state.contacts.push(createContact(action.payload));
    },
    removeContact: (state, action: PayloadAction<{ name: string; tel: string }>) => {
      state.contacts = state.contacts.filter(
        contact => !(contact.name === action.payload.name && contact.tel === action.payload.tel)
      );
    },
    updateContact: (state, action: PayloadAction<{ oldContact: Contact; newContact: Contact }>) => {
      const index = state.contacts.findIndex(
        contact => contact.name === action.payload.oldContact.name && contact.tel === action.payload.oldContact.tel
      );
      if (index !== -1) {
        state.contacts[index] = action.payload.newContact;
      }
    },
    setSelectedContacts: (state, action: PayloadAction<Contact[]>) => {
      state.selectedContacts = action.payload;
    },
  },
});

export const { addContact, removeContact, updateContact, setSelectedContacts } = contactsSlice.actions;

export default contactsSlice.reducer;


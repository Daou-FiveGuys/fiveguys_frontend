'use client'

import { useState, useRef, useEffect } from 'react'
import {PlusIcon, ChevronDownIcon, FolderIcon, SearchIcon, EllipsisVertical} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type AddressEntry = {
    id: string
    name: string
    phoneNumber: string
    email: string
    memo: string
    group: string
    createdAt: Date
}

export default function AddressBook() {
    const [addresses, setAddresses] = useState<AddressEntry[]>([])
    const [groups, setGroups] = useState<string[]>(['Family', 'Friends', 'Work'])
    const [filter, setFilter] = useState<'name' | 'date'>('name')
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
    const [newEntry, setNewEntry] = useState<Partial<AddressEntry>>({ group: 'None' })
    const [editingEntry, setEditingEntry] = useState<AddressEntry | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchCriteria, setSearchCriteria] = useState<'name' | 'phoneNumber' | 'email' | 'memo' | 'all'>('name')
    const newGroupInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isCreatingGroup && newGroupInputRef.current) {
            newGroupInputRef.current.focus()
        }
    }, [isCreatingGroup])

    const handleNewEntry = () => {
        if (!newEntry.name || !newEntry.phoneNumber) {
            alert('Name and phone number are required!')
            return
        }
        const entry: AddressEntry = {
            id: Date.now().toString(),
            name: newEntry.name,
            phoneNumber: newEntry.phoneNumber,
            email: newEntry.email || '',
            memo: newEntry.memo || '',
            group: newEntry.group || 'None',
            createdAt: new Date()
        }
        setAddresses([...addresses, entry])
        setNewEntry({ group: 'None' })
        setIsNewDialogOpen(false)
    }

    const handleEdit = (entry: AddressEntry) => {
        setEditingEntry(entry)
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = () => {
        if (editingEntry) {
            setAddresses(addresses.map(a => a.id === editingEntry.id ? editingEntry : a))
            setIsEditDialogOpen(false)
            setEditingEntry(null)
        }
    }

    const handleDelete = (entry: AddressEntry) => {
        setEditingEntry(entry)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (editingEntry) {
            setAddresses(addresses.filter(a => a.id !== editingEntry.id))
            setIsDeleteDialogOpen(false)
            setEditingEntry(null)
        }
    }

    const handleSendMessage = (entry: AddressEntry) => {
        setEditingEntry(entry)
        setIsMessageDialogOpen(true)
    }

    const sendMessage = () => {
        console.log(`Sending message to ${editingEntry?.name}: ${message}`)
        setMessage('')
        setIsMessageDialogOpen(false)
        setEditingEntry(null)
    }

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            setGroups([...groups, newGroupName.trim()])
            setNewEntry({ ...newEntry, group: newGroupName.trim() })
            setNewGroupName('')
            setIsCreatingGroup(false)
        }
    }

    const filteredAddresses = addresses.filter(entry => {
        if (!searchTerm) return true
        const lowerSearchTerm = searchTerm.toLowerCase()
        switch (searchCriteria) {
            case 'name':
                return entry.name.toLowerCase().includes(lowerSearchTerm)
            case 'phoneNumber':
                return entry.phoneNumber.includes(lowerSearchTerm)
            case 'email':
                return entry.email.toLowerCase().includes(lowerSearchTerm)
            case 'memo':
                return entry.memo.toLowerCase().includes(lowerSearchTerm)
            case 'all':
                return (
                    entry.name.toLowerCase().includes(lowerSearchTerm) ||
                    entry.phoneNumber.includes(lowerSearchTerm) ||
                    entry.email.toLowerCase().includes(lowerSearchTerm) ||
                    entry.memo.toLowerCase().includes(lowerSearchTerm)
                )
            default:
                return true
        }
    })

    const sortedAddresses = [...filteredAddresses].sort((a, b) => {
        if (filter === 'name') {
            return a.name.localeCompare(b.name)
        } else {
            return b.createdAt.getTime() - a.createdAt.getTime()
        }
    })

    const groupedAddresses = sortedAddresses.reduce((acc, entry) => {
        if (!acc[entry.group]) {
            acc[entry.group] = []
        }
        acc[entry.group].push(entry)
        return acc
    }, {} as Record<string, AddressEntry[]>)

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Address Book</h1>
                <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" /> New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={newEntry.name || ''}
                                onChange={e => setNewEntry({ ...newEntry, name: e.target.value })}
                            />
                            <Input
                                placeholder="Phone Number"
                                value={newEntry.phoneNumber || ''}
                                onChange={e => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                value={newEntry.email || ''}
                                onChange={e => setNewEntry({ ...newEntry, email: e.target.value })}
                            />
                            <Input
                                placeholder="Memo"
                                value={newEntry.memo || ''}
                                onChange={e => setNewEntry({ ...newEntry, memo: e.target.value })}
                            />
                            {isCreatingGroup ? (
                                <div className="flex items-center space-x-2">
                                    <Input
                                        ref={newGroupInputRef}
                                        placeholder="New Group Name"
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                handleCreateGroup()
                                            } else if (e.key === 'Escape') {
                                                setIsCreatingGroup(false)
                                                setNewGroupName('')
                                            }
                                        }}
                                    />
                                    <Button onClick={handleCreateGroup}>Create</Button>
                                </div>
                            ) : (
                                <Select
                                    value={newEntry.group}
                                    onValueChange={value => {
                                        if (value === 'create_group') {
                                            setIsCreatingGroup(true)
                                        } else {
                                            setNewEntry({ ...newEntry, group: value })
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        {groups.map(group => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                        <SelectItem value="create_group">Create Group</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            <Button onClick={handleNewEntry}>Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex space-x-2 mb-4">
                <Select value={searchCriteria} onValueChange={(value: typeof searchCriteria) => setSearchCriteria(value)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="phoneNumber">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="memo">Memo</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        className="pl-8"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="mb-4">
                <Select value={filter} onValueChange={(value: 'name' | 'date') => setFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="date">Sort by Creation Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-4">
                {Object.entries(groupedAddresses).map(([group, entries]) => (
                    <div key={group} className="border rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-2 flex items-center">
                            <FolderIcon className="mr-2 h-5 w-5" />
                            {group}
                        </h2>
                        <div className="space-y-2">
                            {entries.map(entry => (
                                <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-bold">{entry.name}</p>
                                        <p>{entry.phoneNumber}</p>
                                        <p className="text-sm text-gray-500">{entry.email}</p>
                                        {entry.memo && <p className="text-sm italic">{entry.memo}</p>}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost"><EllipsisVertical className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => handleEdit(entry)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDelete(entry)}>Delete</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleSendMessage(entry)}>Send Message</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Name"
                            value={editingEntry?.name || ''}
                            onChange={e => setEditingEntry(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                        <Input
                            placeholder="Phone Number"
                            value={editingEntry?.phoneNumber || ''}
                            onChange={e => setEditingEntry(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                        />
                        <Input
                            placeholder="Email"
                            value={editingEntry?.email || ''}
                            onChange={e => setEditingEntry(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                        <Input
                            placeholder="Memo"
                            value={editingEntry?.memo || ''}
                            onChange={e => setEditingEntry(prev => prev ? { ...prev, memo: e.target.value } : null)}
                        />
                        <Select
                            value={editingEntry?.group}
                            onValueChange={value => setEditingEntry(prev => prev ? { ...prev, group: value } : null)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                {groups.map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSaveEdit}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this address?</p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Message</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Type your message (Press Enter to send, Esc to cancel)"
                        value={message}

                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                sendMessage()
                            } else if (e.key === 'Escape') {
                                setIsMessageDialogOpen(false)
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
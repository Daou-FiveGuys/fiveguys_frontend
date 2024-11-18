import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronUp, Edit, FolderPlus, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {CustomSelect} from "@/app/address/address-book";
import {AddressEntry} from "@/app/address/entity";

type Folder = {
    id: string
    name: string
    subFolders: Folder[]
    addresses: AddressEntry[]
}

function FolderTree({ folders, currentFolder, setCurrentFolder, addFolder, setFolders, isLoading }: { folders: any; currentFolder: any; setCurrentFolder: any; addFolder: any; setFolders: any; isLoading: boolean }) {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <AddFolderForm addFolder={addFolder} />
            </div>
            {folders.map((folder : any) => (
                <FolderItem
                    key={folder.id}
                    folder={folder}
                    currentFolder={currentFolder}
                    setCurrentFolder={setCurrentFolder}
                    addFolder={addFolder}
                    setFolders={setFolders}
                    folders={folders}
                />
            ))}
        </div>
    )
}

function FolderItem({ folder, currentFolder, setCurrentFolder, addFolder, setFolders, folders }:{ folder : any; currentFolder : any; setCurrentFolder : any; addFolder : any; setFolders : any; folders : any}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [folderSortOrder, setFolderSortOrder] = useState<'asc' | 'desc'>('asc')

    const editFolder = (newName: string) => {
        const updateFolderRecursively = (folders: Folder[]): Folder[] => {
            return folders.map(f => {
                if (f.id === folder.id) {
                    return { ...f, name: newName };
                }
                if (f.subFolders.length > 0) {
                    return { ...f, subFolders: updateFolderRecursively(f.subFolders) };
                }
                return f;
            });
        };
        setFolders(updateFolderRecursively(folders));
    }

    const deleteFolder = () => {
        if (window.confirm('해당 폴더를 삭제하시겠습니까?\n삭제시 취소 및 복구가 불가합니다.')) {
            const deleteFolderRecursively = (folders: Folder[]): Folder[] => {
                return folders.filter(f => {
                    if (f.id === folder.id) {
                        return false;
                    }
                    if (f.subFolders.length > 0) {
                        f.subFolders = deleteFolderRecursively(f.subFolders);
                    }
                    return true;
                });
            };
            setFolders(deleteFolderRecursively(folders));
            if (currentFolder.id === folder.id) {
                setCurrentFolder(folders[0]);
            }
        }
    }

    const sortedSubFolders = [...folder.subFolders].sort((a, b) => {
        return folderSortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    })

    return (
        <div>
            <div className={`flex items-center space-x-2 py-2 px-3 rounded-lg ${currentFolder.id === folder.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors duration-200`}>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <span
                    className={`flex-grow cursor-pointer ${currentFolder.id === folder.id ? 'font-bold' : ''}`}
                    onClick={() => setCurrentFolder(folder)}
                >
          {folder.name} ({folder.subFolders.length + folder.addresses.length})
        </span>
                <Button variant="ghost" size="icon" onClick={() => {
                    const newName = prompt('새 폴더 이름을 입력하세요:', folder.name);
                    if (newName) editFolder(newName);
                }} className="text-gray-500 hover:text-blue-500">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={deleteFolder} className="text-gray-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6"
                    >
                        <div className="flex justify-between items-center mb-2 mt-2">
                            <CustomSelect
                                value={folderSortOrder}
                                onChange={(value: 'asc' | 'desc') => setFolderSortOrder(value)}
                                options={[
                                    { value: 'asc', label: '오름차순' },
                                    { value: 'desc', label: '내림차순' },
                                ]}
                                className="w-32"
                            />
                        </div>
                        <AddFolderForm addFolder={(name : any) => {
                            const newFolder = {
                                id: Date.now().toString(),
                                name: name,
                                subFolders: [],
                                addresses: []
                            };
                            const addFolderRecursively = (folders: Folder[]): Folder[] => {
                                return folders.map(f => {
                                    if (f.id === folder.id) {
                                        return { ...f, subFolders: [...f.subFolders, newFolder] };
                                    }
                                    if (f.subFolders.length > 0) {
                                        return { ...f, subFolders: addFolderRecursively(f.subFolders) };
                                    }
                                    return f;
                                });
                            };
                            setFolders(addFolderRecursively(folders));
                        }} />
                        {sortedSubFolders.map(subFolder => (
                            <FolderItem
                                key={subFolder.id}
                                folder={subFolder}
                                currentFolder={currentFolder}
                                setCurrentFolder={setCurrentFolder}
                                addFolder={addFolder}
                                setFolders={setFolders}
                                folders={folders}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function AddFolderForm({ addFolder }: any) {
    const [newFolderName, setNewFolderName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newFolderName.trim()) {
            addFolder(newFolderName)
            setNewFolderName('')
        }
    }

    return (
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          placeholder="새 폴더 이름"
          className="rounded-lg bg-gray-100 dark:bg-gray-700"
        />
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          추가
        </Button>
      </form>
    )
}

export { FolderTree, FolderItem, AddFolderForm };
export type { Folder };
import {Dispatch, SetStateAction, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {ChevronDown, ChevronUp, Edit, FolderPlus, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {CustomSelect} from "@/app/address/address-book";
import {Contact2, Group2, Folder2} from "@/app/address/entity";

/**
 * 좌측에 나타나는 폴더 재귀 정보를 보여주는 컴포넌트
 * 
 * 업데이트 시 폴더와 그룹정보만 나타난다.
 * 
 * @param param 
 * @returns 
 */
function FolderTree({ topFolder2s, currentGroup2, setCurrentGroup2, addFolder, setFolders, isLoading }: 
    { topFolder2s: Folder2[]; currentGroup2: Group2; setCurrentGroup2: Dispatch<SetStateAction<Group2>>; addFolder: (name: string, parentFolder2?: Folder2 | null) => Promise<void>; setFolders: Dispatch<SetStateAction<Folder2[]>>; isLoading: boolean }) {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <AddFolderForm addFolder={addFolder} />
            </div>
            {topFolder2s.map(folder2 => (
                <FolderItem
                    key={folder2.folderId}
                    folder={folder2}
                    currentGroup2={currentGroup2}
                    setCurrentGroup2={setCurrentGroup2}
                    addFolder={addFolder}
                    setFolders={setFolders}
                    folders={topFolder2s} // TODO: ?????
                />
            ))}
        </div>
    )
}

function FolderItem({ 
    folder, 
    currentGroup2, 
    setCurrentGroup2, 
    addFolder, 
    setFolders, 
    folders 
  }: { 
    folder: Folder2; 
    currentGroup2: Group2; 
    setCurrentGroup2: Dispatch<SetStateAction<Group2>>; 
    addFolder: (name: string, parentFolder2?: Folder2 | null) => Promise<void>; 
    setFolders: Dispatch<SetStateAction<Folder2[]>>; 
    folders: Folder2[]; 
  }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [folderSortOrder, setFolderSortOrder] = useState<'asc' | 'desc'>('asc');
  
    const editFolder = (newName: string) => {
      const updateFolderRecursively = (folders: Folder2[]): Folder2[] => {
        return folders.map(f => {
          if (f.folderId === folder.folderId) {
            return { ...f, name: newName };
          }
          return f;
        });
      };
      setFolders(updateFolderRecursively(folders));
    };
  
    const deleteFolder = () => {
      if (window.confirm('해당 폴더를 삭제하시겠습니까?\n삭제시 취소 및 복구가 불가합니다.')) {
        const deleteFolderRecursively = (folders: Folder2[]): Folder2[] => {
          return folders.filter(f => f.folderId !== folder.folderId);
        };
        setFolders(deleteFolderRecursively(folders));
        if (
          folder.group2s.length > 0 &&
          currentGroup2.groupsId === folder.group2s[0].groupsId
        ) {
          setCurrentGroup2(folders[0]?.group2s[0] || {});
        }
      }
    };
  
    // 그룹이 없는 경우 빈 배열 반환
    const sortedSubFolders = folder.group2s.length > 0
      ? [...folder.group2s].sort((a, b) =>
          folderSortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        )
      : [];
  
    return (
      <div>
        <div className={`flex items-center space-x-2 py-2 px-3 rounded-lg ${folder.group2s[0] && currentGroup2.groupsId === folder.group2s[0].groupsId ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors duration-200`}>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <span
            className={`flex-grow cursor-pointer ${folder.group2s[0] && currentGroup2.groupsId === folder.group2s[0].groupsId ? 'font-bold' : ''}`}
            onClick={() => folder.group2s[0] && setCurrentGroup2(folder.group2s[0])}
          >
            {folder.name} ({folder.group2s.length + (folder.group2s[0]?.contact2s.length || 0)})
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
              {sortedSubFolders.map(subFolder => (
                <FolderItem
                  key={subFolder.groupsId}
                  folder={{
                    folderId: Date.now(),
                    name: 'test',
                    group2s: [],
                  }}
                  currentGroup2={currentGroup2}
                  setCurrentGroup2={setCurrentGroup2}
                  addFolder={addFolder}
                  setFolders={setFolders}
                  folders={folders}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
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
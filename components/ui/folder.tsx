'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, FolderPlus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/app/address/address-book';
import { Group2, Folder2 } from '@/app/address/entity';

/**
 * 폴더 및 그룹의 재귀 트리를 렌더링하는 컴포넌트
 */
function FolderTree({
  topFolder2s,
  currentGroup2,
  setCurrentGroup2,
  addFolder2AndGroup2,
  setFolders,
  isLoading,
}: {
  topFolder2s: Folder2[];
  currentGroup2: Group2;
  setCurrentGroup2: Dispatch<SetStateAction<Group2>>;
  addFolder2AndGroup2: (name: string, parentFolder2?: Folder2 | null) => Promise<void>;
  setFolders: Dispatch<SetStateAction<Folder2[]>>;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* 새 폴더 추가 */}
      <div className="mb-4">
        <AddFolderForm addFolder={(name) => addFolder2AndGroup2(name, null)} />
      </div>
      {/* 최상위 폴더 렌더링 */}
      {topFolder2s.map((folder2) => (
        <FolderItem
          key={folder2.folderId}
          folder={folder2}
          currentGroup2={currentGroup2}
          setCurrentGroup2={setCurrentGroup2}
          addFolder2AndGroup2={addFolder2AndGroup2}
          setFolders={setFolders}
          folders={topFolder2s}
        />
      ))}
    </div>
  );
}

/**
 * 개별 폴더/그룹 항목을 렌더링하는 컴포넌트
 */
function FolderItem({
  folder,
  currentGroup2,
  setCurrentGroup2,
  addFolder2AndGroup2,
  setFolders,
  folders,
}: {
  folder: Folder2;
  currentGroup2: Group2;
  setCurrentGroup2: Dispatch<SetStateAction<Group2>>;
  addFolder2AndGroup2: (name: string, parentFolder2?: Folder2 | null) => Promise<void>;
  setFolders: Dispatch<SetStateAction<Folder2[]>>;
  folders: Folder2[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 폴더 수정
  const handleEditFolder = () => {
    const newName = prompt('새 폴더 이름을 입력하세요:', folder.name);
    if (newName) {
      setFolders((prevFolders) =>
        prevFolders.map((f) =>
          f.folderId === folder.folderId ? { ...f, name: newName } : f
        )
      );
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = () => {
    if (window.confirm('해당 폴더를 삭제하시겠습니까?')) {
      setFolders((prevFolders) =>
        prevFolders.filter((f) => f.folderId !== folder.folderId)
      );
    }
  };

  // 그룹 수정
  const handleEditGroup = (group: Group2) => {
    const newName = prompt('새 그룹 이름을 입력하세요:', group.name);
    if (newName) {
      setFolders((prevFolders) =>
        prevFolders.map((f) =>
          f.folderId === folder.folderId
            ? {
                ...f,
                group2s: f.group2s.map((g) =>
                  g.groupsId === group.groupsId ? { ...g, name: newName } : g
                ),
              }
            : f
        )
      );
    }
  };

  // 그룹 삭제
  const handleDeleteGroup = (group: Group2) => {
    if (window.confirm('해당 그룹을 삭제하시겠습니까?')) {
      setFolders((prevFolders) =>
        prevFolders.map((f) =>
          f.folderId === folder.folderId
            ? {
                ...f,
                group2s: f.group2s.filter((g) => g.groupsId !== group.groupsId),
              }
            : f
        )
      );
    }
  };

  return (
    <div>
      {/* 폴더 헤더 */}
      <div
        className={`flex items-center space-x-2 py-2 px-3 rounded-lg ${
          folder.group2s.some((group) => group.groupsId === currentGroup2.groupsId)
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        } transition-colors duration-200`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
        <span
          className={`flex-grow cursor-pointer ${
            folder.group2s.some((group) => group.groupsId === currentGroup2.groupsId)
              ? 'font-bold'
              : ''
          }`}
          onClick={() => setCurrentGroup2(folder.group2s[0] || {})}
        >
          {folder.name} ({folder.group2s.length})
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditFolder}
          className="text-gray-500 hover:text-blue-500"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteFolder}
          className="text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 그룹 리스트 및 추가 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6"
          >
            <AddGroupForm addFolder2AndGroup2={addFolder2AndGroup2} folder2={folder} />
            {folder.group2s.map((group) => (
              <div
                key={group.groupsId}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 mb-2"
              >
                <span
                  className={`flex-grow cursor-pointer ${
                    currentGroup2.groupsId === group.groupsId ? 'font-bold' : ''
                  }`}
                  onClick={() => setCurrentGroup2(group)}
                >
                  {group.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditGroup(group)}
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGroup(group)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 폴더 추가 폼
 */
function AddFolderForm({ addFolder }: { addFolder: (name: string) => void }) {
  const [newFolderName, setNewFolderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName);
      setNewFolderName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
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
  );
}

/**
 * 그룹 추가 폼
 */
function AddGroupForm({
  addFolder2AndGroup2,
  folder2,
}: {
    addFolder2AndGroup2: (name: string, parentFolder2?: Folder2 | null) => Promise<void>;
  folder2: Folder2;
}) {
  const [newGroupName, setNewGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
        addFolder2AndGroup2(newGroupName, folder2);
      setNewGroupName('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 mt-4 mb-4"
    >
      <Input
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        placeholder="새 그룹 이름"
        className="rounded-lg bg-gray-100 dark:bg-gray-700"
      />
      <Button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors duration-300"
      >
        <FolderPlus className="mr-2 h-4 w-4" />
        추가
      </Button>
    </form>
  );
}

export { FolderTree, FolderItem, AddFolderForm, AddGroupForm };

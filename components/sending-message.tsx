'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface SendingMessageProps {
  recipient: string;
  isGroup: boolean;
  lastCreatedMessage: string;
  currentImageUrl: string;
}

interface ApiErrorResponse {
  error: string;
}

interface GroupData {
  name: string;
  members: string[];
}

export function SendingMessage({ recipient, isGroup, lastCreatedMessage, currentImageUrl }: SendingMessageProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [groupData, setGroupData] = useState<GroupData | null>(null)

  const isValidName = (input: string) => /^[a-zA-Z가-힣\s]+$/.test(input);
  const isValidPhoneNumber = (input: string) => /^\d{11}$/.test(input);

  useEffect(() => {
    if (isGroup) {
      fetchGroupData();
    } else {
      sendMessage();
    }
  }, []);

  const getGroupData = async (groupId: string): Promise<GroupData> => {
    try {
      const response = await axios.get<GroupData | ApiErrorResponse>(
        `http://localhost:8080/api/v1/group2/${groupId}`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );

      if ('error' in response.data) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        throw new Error(apiError.error || '그룹 데이터를 가져오는데 실패했습니다.');
      }
      throw new Error('그룹 데이터를 가져오는데 실패했습니다.');
    }
  };
  const fetchGroupData = async () => {

    try {
      const data = await getGroupData(recipient);
      setGroupData(data);
      sendMessage();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '그룹 데이터를 가져오는데 실패했습니다.');
    }
  };
  //그룹 조회 기능 -> sendingMessage

  const sendMessage = async () => {
    if (isGroup) {
      if (!groupData) {
        setStatus('error');
        setErrorMessage('그룹 데이터가 없습니다.');
        return;
      }
      await sendGroupMessage(groupData.members, lastCreatedMessage);
    } else {
      if (!isValidName(recipient) && !isValidPhoneNumber(recipient)) {
        setStatus('error')
        setErrorMessage('잘못된 형식입니다. 이름 또는 11자리 전화번호를 입력해주세요.')
        return
      }
      await sendIndividualMessage(recipient, lastCreatedMessage);
    }
  }
  // 그룹 -> GroupsendMessageToServer로 전달, 한명 -> OnesendMessageToServer로 전달

  const sendGroupMessage = async (members: string[], message: string) => {
    setStatus('sending');
    try {
      await GroupsendMessageToServer(members.map(member => ({ [member]: {} })), message);
      setStatus('success');
    } catch (error) {
      handleSendError(error);
    }
  };

  const sendIndividualMessage = async (recipient: string, message: string) => {
    setStatus('sending');
    try {
      await OnesendMessageToServer([{ [recipient]: {} }], message);
      setStatus('success');
    } catch (error) {
      handleSendError(error);
    }
  };

  const OnesendMessageToServer = async (targets: Array<{ [key: string]: {} }>, content: string) => {
    const response = await axios.post<ApiErrorResponse>(
      'http://localhost:8080/api/v1/ppurio/send',
      {
        messageType: '',
        content: content,
        fromNumber: '',
        targets: targets,
        subject: '',
        filePaths: ['']
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  };
  const GroupsendMessageToServer = async (targets: Array<{ [key: string]: {} }>, content: string) => {
    const response = await axios.post<ApiErrorResponse>(
      'http://localhost:8080/api/v1/ppurio/send',
      {
        messageType: '',
        content: content,
        fromNumber: '',
        targets: targets,
        subject: '',
        filePaths: ['']
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  };

  const handleSendError = (error: unknown) => {
    setStatus('error');
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiErrorResponse;
      setErrorMessage(apiError.error || '메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } else {
      setErrorMessage('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">메시지 전송</h3>
      <p><strong>{isGroup ? "그룹명" : "수신자"}:</strong> {recipient}</p>
      {status === 'sending' && <p>메시지 전송 중...</p>}
      {status === 'success' && (
        <div>
          <p className="text-green-600">메시지가 성공적으로 전송되었습니다.</p>
          <h5 className="mt-2">{lastCreatedMessage}</h5>
          {currentImageUrl && <img src={currentImageUrl} alt="전송된 이미지" className="mt-2 max-w-full h-auto" />}
        </div>
      )}
      {status === 'error' && <p className="text-red-600">오류: {errorMessage}</p>}
    </div>
  )
}
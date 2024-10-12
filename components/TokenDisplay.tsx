import React from 'react';

interface TokenDisplayProps {
  remainingTokens: number;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ remainingTokens }) => {
  return (
    <div className="p-4 bg-primary/10 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">남은 토큰</h2>
      <p className="text-3xl font-bold">{remainingTokens}</p>
      <p className="text-sm text-muted-foreground mt-2">
        현재 사용 가능한 토큰 수입니다.
      </p>
    </div>
  );
};

export default TokenDisplay;
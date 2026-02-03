import React from 'react';

interface UserInfoProps {
  user: {
    name: string;
    role: string;
  };
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border flex items-center space-x-3 z-50">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{user.name}</div>
        <div className="text-gray-500 capitalize">{user.role}</div>
      </div>
    </div>
  );
}
import React from 'react';
import { CatTab } from './CatTab';

export const DragonTab: React.FC<any> = ({ onSwitchTab }) => {
  return <CatTab onSwitchTab={onSwitchTab} />;
};

import React from 'react';

/**
 * Component giúp ngăn chặn sự kiện lan toả từ modal con đến modal cha
 * hoặc các component ở phía sau
 */
const ModalEventCatcher = ({ children, className = '' }) => {
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`modal-event-catcher ${className}`} onClick={handleClick}>
      {children}
    </div>
  );
};

export default ModalEventCatcher;

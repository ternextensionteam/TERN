import React from 'react';
import TaskSection from '../TaskSection/TaskSection';

function Sidebar() {
  return (        
    <div role="complementary" aria-label="Sidebar" className="sidebar container p-3">
        <TaskSection />
    </div>);
}

export default Sidebar;
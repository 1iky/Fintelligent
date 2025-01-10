import React from 'react';
import { Robot } from 'lucide-react'; // or use any other icon library you prefer

const TaskPaneHeader = () => {
  return (
    <div className="task-pane-header flex items-center space-x-2">
      <Robot className="h-6 w-6 text-gray-600" />
      <h1>Fintelligent Assistant</h1>
    </div>
  );
};

export default TaskPaneHeader;

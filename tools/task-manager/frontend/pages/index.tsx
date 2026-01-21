import React, { useState, useEffect } from 'react';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch('/api/tools/task-manager')
            .then(res => res.json())
            .then(data => setTasks(data.data || []));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Tasks</h1>
            <div className="space-y-2">
                {tasks.map((task: any) => (
                    <div key={task.id} className="p-4 bg-white rounded-lg shadow">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500">{task.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

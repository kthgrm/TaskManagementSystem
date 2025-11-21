import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProjectContextType {
    refreshTrigger: number;
    triggerProjectRefresh: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerProjectRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <ProjectContext.Provider value={{ refreshTrigger, triggerProjectRefresh }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectRefresh() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectRefresh must be used within a ProjectProvider');
    }
    return context;
}

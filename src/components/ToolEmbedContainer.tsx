import React from 'react';
import { LayoutTemplate } from 'lucide-react';

export const ToolEmbedContainer: React.FC = () => {
    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight">外部资源计算器</h2>
            </div>

            {/* 
        This is the dedicated placeholder for external tools (e.g., an iframe).
        It features a soft inner shadow, rounded corners, and a minimum height of 500px as requested.
      */}
            <div className="w-full min-h-[500px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 shadow-inner flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group transition-colors hover:bg-gray-50 hover:border-gray-400">

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0066FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="relative z-10 flex flex-col items-center gap-4 text-gray-400 group-hover:text-gray-500 transition-colors">
                    <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
                        <LayoutTemplate className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-700 mb-1">资源计算器组件加载区</p>
                        <p className="text-sm font-medium">(请将外部工具链接嵌入至此)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

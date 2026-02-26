import React from 'react';
import { MessageSquare, Send, ThumbsUp, AlertCircle, Lightbulb } from 'lucide-react';

const recentFeedback = [
    { id: 1, type: 'bug', content: '在燧原平台运行千帆推理服务时，长文本截断会导致 OOM，希望能提供配置项。', model: '千帆平台', hardware: '燧原', time: '10 分钟前' },
    { id: 2, type: 'suggestion', content: '建议在算力计算器中增加多卡并行效率的预估，这对于我们规划 H200 集群很有帮助。', model: '通用', hardware: 'NVIDIA', time: '1 小时前' },
    { id: 3, type: 'kudo', content: '最新一版的 PaddlePaddle 对昇腾芯片的适配非常棒！性能提升了近 30%，点赞！', model: '飞桨', hardware: '昇腾', time: '3 小时前' },
];

export const UserFeedback: React.FC = () => {
    return (
        <div className="w-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50">
                <h2 className="text-2xl font-bold tracking-tight">用户反馈与追踪</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/50">

                {/* Left Col: Submission Form */}
                <div className="p-6 bg-gray-50/30">
                    <form className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">目标模型 / 框架</label>
                                <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all">
                                    <option>文心一言 4.0</option>
                                    <option>飞桨 PaddlePaddle</option>
                                    <option>千帆大模型平台</option>
                                    <option>其他</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">运行硬件</label>
                                <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all">
                                    <option>NVIDIA GPU</option>
                                    <option>昇腾 NPU</option>
                                    <option>昆仑芯</option>
                                    <option>燧原</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">详细描述</label>
                            <textarea
                                rows={4}
                                placeholder="请详细描述您遇到的问题、改进建议或成功经验..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all resize-none"
                            ></textarea>
                        </div>

                        <button type="button" className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-lg py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                            <Send className="w-4 h-4" /> 提交反馈
                        </button>
                    </form>
                </div>

                {/* Right Col: Feedback List */}
                <div className="p-6 bg-white overflow-y-auto max-h-[400px]">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Recent Signals
                    </h3>

                    <div className="space-y-4">
                        {recentFeedback.map((item) => (
                            <div key={item.id} className="group relative pl-4 pb-4 border-l-2 border-gray-100 last:border-b-0 last:pb-0">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${item.type === 'bug' ? 'bg-red-400' :
                                    item.type === 'suggestion' ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`} />

                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-gray-200 transition-colors">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.type === 'bug' ? 'bg-red-100 text-red-700' :
                                            item.type === 'suggestion' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {item.type === 'bug' && <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                            {item.type === 'suggestion' && <Lightbulb className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                            {item.type === 'kudo' && <ThumbsUp className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                            {item.type === 'bug' ? 'Issue' : item.type === 'suggestion' ? 'Idea' : 'Kudos'}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">{item.model} · {item.hardware}</span>
                                        <span className="text-xs text-gray-400 ml-auto">{item.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

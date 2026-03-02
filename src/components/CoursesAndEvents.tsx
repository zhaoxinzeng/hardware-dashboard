import React, { useState } from 'react';
import { PlayCircle, MapPin, ExternalLink, ArrowRight, Pin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoursesData } from '../hooks/useCoursesData';
import { useActivitiesData } from '../hooks/useActivitiesData';

export const CoursesAndEvents: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'events'>('courses');
    const { featuredCourses, courses } = useCoursesData();
    const { featuredActivities, activities } = useActivitiesData();

    return (
        <div className="h-full glass-panel flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">星河多硬件课程与活动</h2>
                {activeTab === 'courses' ? (
                    <Link
                        to="/courses"
                        className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center px-3 py-1.5 rounded-full transition-colors border border-gray-200/50"
                    >
                        全部课程 ({courses.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                ) : (
                    <Link
                        to="/activities"
                        className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center px-3 py-1.5 rounded-full transition-colors border border-gray-200/50"
                    >
                        全部活动 ({activities.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                )}
            </div>

            <div className="flex gap-1 p-1 bg-gray-100/80 rounded-lg mb-6 self-start">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'courses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    相关课程
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'events' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    生态活动
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <div className={`absolute inset-0 transition-all duration-300 w-full overflow-y-auto custom-scrollbar pr-2 ${activeTab === 'courses' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    {featuredCourses.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-medium text-sm">
                            暂无课程数据
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {featuredCourses.map(course => (
                                <div key={course.id} className="overflow-hidden rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${course.difficulty === '入门' ? 'bg-green-50 text-green-700 border-green-200' : course.difficulty === '进阶' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                                {course.difficulty}
                                            </span>
                                            {course.isPinned && (
                                                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60">
                                                    <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1 shrink-0">
                                            <PlayCircle className="w-3.5 h-3.5" /> {course.duration}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-sm text-gray-900 leading-relaxed">{course.title}</h4>
                                    {course.description && (
                                        <p className="text-xs text-gray-500 leading-relaxed mt-1 mb-3 line-clamp-2">{course.description}</p>
                                    )}
                                    {!course.description && <div className="mb-3" />}

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => window.open(course.url, '_blank', 'noopener,noreferrer')}
                                            className="text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all hover:bg-blue-100 border border-blue-100"
                                        >
                                            去学习 <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`absolute inset-0 transition-all duration-300 w-full overflow-y-auto custom-scrollbar pr-2 ${activeTab === 'events' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    {featuredActivities.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-medium text-sm">
                            暂无活动数据
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {featuredActivities.map(activity => (
                                <div key={activity.id} className="group flex gap-4 rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 hover:shadow-sm hover:border-blue-200 transition-all hover:bg-white">
                                    <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-blue-50 text-[var(--color-tech-blue)] border border-blue-100 group-hover:bg-[var(--color-tech-blue)] group-hover:text-white transition-colors">
                                        <span className="text-[10px] font-bold uppercase">{activity.dateMonth}</span>
                                        <span className="text-lg font-black leading-tight">{activity.dateDay}</span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="px-1.5 py-0.5 rounded bg-gray-200/50 text-[10px] text-gray-600 font-semibold">{activity.formatTag}</span>
                                            {activity.isPinned && (
                                                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60">
                                                    <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{activity.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {activity.location}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => window.open(activity.url, '_blank', 'noopener,noreferrer')}
                                        className="self-center p-2 rounded-full hover:bg-blue-50 text-gray-400 hover:text-[var(--color-tech-blue)] transition-colors"
                                        title="打开活动链接"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

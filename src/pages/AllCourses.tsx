import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, Pin, Plus, PlayCircle, Trash2, ArrowRight, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoursesData } from '../hooks/useCoursesData';
import { useAuth } from '../contexts/AuthContext';
import type { Course, CourseDifficulty } from '../types/course';
import { generateInvalidCourseUrl } from '../utils/courseUrl';

const difficultyBadgeClassMap: Record<CourseDifficulty, string> = {
    入门: 'bg-green-50 text-green-700 border-green-200',
    进阶: 'bg-blue-50 text-blue-700 border-blue-200',
    高阶: 'bg-purple-50 text-purple-700 border-purple-200'
};

const createCourseDraft = () => ({
    title: '',
    description: '',
    url: '',
    duration: '',
    difficulty: '入门' as CourseDifficulty
});

export const AllCourses: React.FC = () => {
    const { sortedCourses, addCourse, togglePinned, removeCourse, updateCourse } = useCoursesData();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [isAdding, setIsAdding] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [newCourse, setNewCourse] = useState(createCourseDraft);

    const resetFormState = () => {
        setNewCourse(createCourseDraft());
        setEditingCourse(null);
    };

    const handleSubmitCourse = () => {
        const title = newCourse.title.trim();
        const duration = newCourse.duration.trim();
        const description = newCourse.description.trim();
        const url = newCourse.url.trim() === '' ? generateInvalidCourseUrl() : newCourse.url.trim();

        if (!title || !duration) {
            return;
        }

        if (editingCourse) {
            updateCourse(editingCourse.id, {
                title,
                description,
                duration,
                difficulty: newCourse.difficulty,
                url
            });
        } else {
            addCourse({
                title,
                description,
                duration,
                difficulty: newCourse.difficulty,
                url
            });
        }

        resetFormState();
        setIsAdding(false);
    };

    const handleStartEdit = (course: Course) => {
        setEditingCourse(course);
        setNewCourse({
            title: course.title,
            description: course.description || '',
            url: course.url,
            duration: course.duration,
            difficulty: course.difficulty
        });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetFormState();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除该课程吗？')) {
            removeCourse(id);
            if (editingCourse?.id === id) {
                resetFormState();
            }
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">
            <header className="sticky top-0 z-50 glass-panel border-b border-border-subtle/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">全部课程</h1>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => {
                            if (isAdding) {
                                setIsAdding(false);
                                resetFormState();
                                return;
                            }
                            setIsAdding(true);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border transition-colors ${isAdding
                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            : 'bg-blue-50 text-[var(--color-tech-blue)] border-blue-100 hover:bg-blue-100'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {isAdding ? '取消新增' : '新增课程'}
                    </button>
                )}
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <p className="text-gray-500 font-medium text-sm mb-6">
                    共 {sortedCourses.length} 门课程，排序规则：置顶优先，其次按最新创建时间。
                </p>

                {isAdmin && isAdding && (
                    <section className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-white p-4 md:p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">{editingCourse ? '修改课程' : '新增课程'}</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            {editingCourse
                                ? '当前为编辑模式：修改后将原地更新该课程，不会改变置顶状态和创建时间。'
                                : '课程链接可暂时留空，保存时系统会自动生成占位无效链接，后续可再替换真实链接。'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                type="text"
                                placeholder="课程名称"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newCourse.title}
                                onChange={e => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="时长 (如 2.5h)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newCourse.duration}
                                onChange={e => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                            />
                            <select
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newCourse.difficulty}
                                onChange={e => setNewCourse(prev => ({ ...prev, difficulty: e.target.value as CourseDifficulty }))}
                            >
                                <option value="入门">入门</option>
                                <option value="进阶">进阶</option>
                                <option value="高阶">高阶</option>
                            </select>
                            <input
                                type="text"
                                placeholder="课程链接 (如 https://...)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={newCourse.url}
                                onChange={e => setNewCourse(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                        <textarea
                            placeholder="课程简介（可选，建议一句话概括课程核心内容）"
                            rows={2}
                            className="w-full mt-3 px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white resize-none"
                            value={newCourse.description}
                            onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="mt-4 flex justify-end">
                            {editingCourse && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors mr-2"
                                >
                                    取消
                                </button>
                            )}
                            <button
                                onClick={handleSubmitCourse}
                                disabled={!newCourse.title.trim() || !newCourse.duration.trim()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white"
                            >
                                {editingCourse ? '保存修改' : '保存课程'}
                            </button>
                        </div>
                    </section>
                )}

                {sortedCourses.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">暂无课程数据</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {sortedCourses.map(course => (
                            <article key={course.id} className="bg-white rounded-xl border border-gray-200/70 shadow-sm p-4 flex flex-col">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${difficultyBadgeClassMap[course.difficulty]}`}>
                                            {course.difficulty}
                                        </span>
                                        {course.isPinned && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60">
                                                <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1 shrink-0">
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        {course.duration}
                                    </span>
                                </div>

                                <h3 className="text-sm font-bold text-gray-900 leading-relaxed">{course.title}</h3>
                                {course.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-2">{course.description}</p>
                                )}

                                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                    <button
                                        onClick={() => window.open(course.url, '_blank', 'noopener,noreferrer')}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold text-[var(--color-tech-blue)] bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        去学习 <ArrowRight className="w-3.5 h-3.5" />
                                    </button>

                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStartEdit(course)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:text-[var(--color-tech-blue)] hover:border-blue-200 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                编辑
                                            </button>

                                            <button
                                                onClick={() => togglePinned(course.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-colors ${course.isPinned
                                                    ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                    : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                                {course.isPinned ? '取消置顶' : '置顶'}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                删除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

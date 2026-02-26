import React from 'react';
import { Header } from '../components/Header';
import { PartnerNews } from '../components/PartnerNews';
import { AdaptationMatrix } from '../components/AdaptationMatrix';
import { CoursesAndEvents } from '../components/CoursesAndEvents';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { UserFeedback } from '../components/UserFeedback';
import { ToolEmbedContainer } from '../components/ToolEmbedContainer';

export const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)] pb-12">
            <Header />

            <main className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">

                {/* Module 1: Hardware Partner News */}
                <section aria-label="Hardware Partner News">
                    <PartnerNews />
                </section>

                {/* Module 2: Adaptation Matrix */}
                <section aria-label="Adaptation Matrix">
                    <AdaptationMatrix />
                </section>

                {/* Row 2 Grid: Courses and Featured Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section aria-label="Courses and Events" className="h-full">
                        <CoursesAndEvents />
                    </section>

                    <section aria-label="Featured Partner Products" className="h-full">
                        <FeaturedProducts />
                    </section>
                </div>

                {/* Module 5: User Feedback */}
                <section aria-label="User Feedback">
                    <UserFeedback />
                </section>

                {/* Module 6: Tool Embed Container (Strictly Followed) */}
                <section aria-label="Tool Embed Container" className="pt-4">
                    <ToolEmbedContainer />
                </section>

            </main>
        </div>
    )
}

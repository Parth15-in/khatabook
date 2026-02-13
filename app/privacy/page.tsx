import React from 'react';
import Head from 'next/head';

const PrivacyPage = () => {
    return (
        <main className="min-h-screen bg-[#fcfaf5] p-8 md:p-20">
            <Head>
                <title>Privacy Policy | Top SEO Tools</title>
                <meta name="description" content="How we handle your data." />
            </Head>
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-[#a32a2a]/10">
                <h1 className="text-4xl font-bold mb-8 text-[#2d1a13]">Privacy Policy</h1>
                <div className="space-y-6 text-[#887766] leading-relaxed">
                    <p>Last Updated: October 2023</p>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">1. Information Collection</h2>
                        <p>We collect minimal information to provide our services. This includes account details and usage metrics to improve our tools.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">2. Use of Information</h2>
                        <p>The information we collect is used to personalize your experience, provide support, and improve the accuracy of our SEO analysis.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">3. Data Security</h2>
                        <p>We use industry-standard encryption to protect your data. Your privacy and security are our top priorities.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">4. Third-Party Sharing</h2>
                        <p>We do not sell your personal data. We only share information with third parties as necessary to provide our core services (e.g., payment processing).</p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPage;

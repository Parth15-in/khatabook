import React from 'react';
import Head from 'next/head';

const TermsPage = () => {
    return (
        <main className="min-h-screen bg-[#fcfaf5] p-8 md:p-20">
            <Head>
                <title>Terms of Service | Top SEO Tools</title>
                <meta name="description" content="The terms and conditions for using our platform." />
            </Head>
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-[#a32a2a]/10">
                <h1 className="text-4xl font-bold mb-8 text-[#2d1a13]">Terms of Service</h1>
                <div className="space-y-6 text-[#887766] leading-relaxed">
                    <p>Last Updated: October 2023</p>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">1. Acceptance of Terms</h2>
                        <p>By accessing and using our tools, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">2. Use of Services</h2>
                        <p>Our tools are provided for lawful purposes only. You agree not to use the services in any way that could damage or disable our infrastructure.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">3. Intellectual Property</h2>
                        <p>All content, tools, and algorithms provided on this site are the property of Top SEO Tools. No reproduction or distribution is allowed without written permission.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#443322]">4. Limitation of Liability</h2>
                        <p>Top SEO Tools shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default TermsPage;

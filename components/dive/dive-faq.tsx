'use client';

import React from 'react';
import Link from 'next/link';

const FAQ_ITEMS = [
  {
    q: 'What if someone needs me during a dive?',
    a: "People get through. Feeds don't. Dive only quiets the apps on your quiet list, so leave out the apps people reach you on, like Messages or WhatsApp, and they stay open. And surfacing is always one tap.",
    defaultOpen: true,
  },
  {
    q: 'Is this a Pomodoro timer?',
    a: 'No. A dive has no countdown and no breaks inside it, because being interrupted is what pulls you out of the work. The clock counts up. You rest between dives, when you choose.',
  },
  {
    q: 'What if I forget to surface?',
    a: 'After a long dive, a quiet "Still diving?" appears on your Lock Screen. Your apps don\'t stay quiet all night because you forgot.',
  },
  {
    q: "I've quit every system I've tried. Why is this different?",
    a: "There's nothing to maintain. No streaks to protect, no list to groom, no days to catch up on. Miss a week and Dive just offers one small dive when you're back.",
  },
  {
    q: 'Do I need the other Improve apps?',
    a: 'No. Dive works on its own. If you use Second Brain, your next steps can come from your projects there, so the pick-up line fills itself.',
  },
  {
    q: 'What does Dive know about me?',
    a: "Only what's on your devices. Dive has no account and sends us nothing; its App Store label is Data Not Collected. Sync runs through your own iCloud.",
  },
];

export function DiveFaq() {
  return (
    <section id="faq" className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-[680px] mx-auto">
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px]">
            Questions
          </div>
          <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0">
            Before you dive
          </h2>
        </div>

        <div className="max-w-[760px] mx-auto mt-12">
          {FAQ_ITEMS.map((item, idx) => (
            <details
              key={idx}
              open={item.defaultOpen}
              className="group border-t-[0.75px] border-white/12 py-1"
            >
              <summary className="list-none cursor-pointer py-5 text-[17px] font-medium flex justify-between items-center gap-4 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="font-light text-[22px] leading-none text-white/42 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-[16px] leading-[1.6] text-white/66 pb-[22px] max-w-[640px] m-0">
                {item.a}
              </p>
            </details>
          ))}

          <details className="group border-t-[0.75px] border-b-[0.75px] border-white/12 py-1">
            <summary className="list-none cursor-pointer py-5 text-[17px] font-medium flex justify-between items-center gap-4 [&::-webkit-details-marker]:hidden">
              <span>Can I cancel any time?</span>
              <span className="font-light text-[22px] leading-none text-white/42 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-[16px] leading-[1.6] text-white/66 pb-[22px] max-w-[640px] m-0">
              Yes. Subscriptions are handled by Apple, and you can cancel in your Apple account settings. See the{' '}
              <Link href="/refund" className="underline text-white/80 hover:text-white">
                refund policy
              </Link>
              .
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

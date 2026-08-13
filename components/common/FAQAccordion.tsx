'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

const AccordionWrapper = styled.div`
  margin: 40px 0;
`;

const AccordionHeading = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text, #1A1A1A);
  margin-bottom: 24px;
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid var(--color-border, #E4E8EE);
  &:first-of-type {
    border-top: 1px solid var(--color-border, #E4E8EE);
  }
`;

const AccordionTitle = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text, #123353);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary, #0d6efd);
  }
`;

const AccordionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg-tertiary, #f8f9fa);
  color: var(--color-text-secondary, #6c757d);
  font-size: 18px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  padding: 0 0 20px 0;
  font-size: 15px;
  color: var(--color-text-secondary, #4a4a4a);
  line-height: 1.6;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  
  /* If the answer contains HTML */
  p {
    margin: 0;
  }
`;

interface FAQ {
  id: number;
  question: string;
  answer: string | any;
}

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  // Filter out empty FAQs
  const validFaqs = faqs?.filter(faq => faq.question && faq.question.trim() !== '' && faq.answer);

  if (!validFaqs || validFaqs.length === 0) return null;

  return (
    <AccordionWrapper>
      <AccordionHeading>Frequently Asked Questions</AccordionHeading>
      {validFaqs.map((faq) => (
        <AccordionItem key={faq.id}>
          <AccordionTitle onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
            {faq.question}
            <AccordionIcon>{openId === faq.id ? '−' : '+'}</AccordionIcon>
          </AccordionTitle>
          <AccordionContent $isOpen={openId === faq.id}>
            {typeof faq.answer === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            ) : (
              <p>Answer content</p> // Fallback for blocks/richtext if parsing needed
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionWrapper>
  );
}

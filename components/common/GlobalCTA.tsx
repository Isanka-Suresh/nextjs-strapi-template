'use client';

import React from 'react';
import styled from 'styled-components';

const CTAWrapper = styled.div`
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CTATopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CTAHeading = styled.a`
  font-size: 16px;
  color: var(--color-primary, #0d6efd);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  margin: 0;
  &:hover {
    color: #0b5ed7;
  }
`;

const CTAText = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary, #6c757d);
  margin: 0;
  line-height: 1.5;
`;

const CTAButtonPrimary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #25D366; /* WhatsApp Green */
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
    color: #ffffff;
  }
`;

const CTAButtonSecondary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

interface CTAProps {
  heading?: string;
  text?: string;
  linkText?: string;
  linkUrl?: string;
  secondaryLinkText?: string;
  secondaryLinkUrl?: string;
}

export default function GlobalCTA({ heading, text, linkText, linkUrl, secondaryLinkText, secondaryLinkUrl }: CTAProps) {
  if (!heading && !text && !linkText && !secondaryLinkText) return null;

  // Assume heading acts as a primary link if it exists, or just a text
  return (
    <CTAWrapper>
      <CTATopRow>
        {heading && (
          <CTAHeading href={linkUrl || "#"}>{heading}</CTAHeading>
        )}
        {linkText && linkUrl && (
          <CTAButtonPrimary href={linkUrl}>{linkText}</CTAButtonPrimary>
        )}
        {secondaryLinkText && secondaryLinkUrl && (
          <CTAButtonSecondary href={secondaryLinkUrl}>{secondaryLinkText}</CTAButtonSecondary>
        )}
      </CTATopRow>
      {text && <CTAText>{text}</CTAText>}
    </CTAWrapper>
  );
}

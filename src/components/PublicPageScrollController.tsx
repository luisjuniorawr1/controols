'use client';

import { useEffect } from 'react';

export default function PublicPageScrollController() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const marketingHome = document.querySelector('.marketing-home');

    if (!marketingHome) return;

    const previous = {
      htmlHeight: html.style.height,
      htmlOverflowX: html.style.overflowX,
      htmlOverflowY: html.style.overflowY,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyHeight: body.style.height,
      bodyMinHeight: body.style.minHeight,
      bodyMaxHeight: body.style.maxHeight,
      bodyOverflowX: body.style.overflowX,
      bodyOverflowY: body.style.overflowY,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.height = 'auto';
    html.style.overflowY = 'auto';
    html.style.overflowX = 'hidden';
    html.style.overscrollBehavior = 'auto';
    body.style.height = 'auto';
    body.style.minHeight = '100%';
    body.style.maxHeight = 'none';
    body.style.overflowY = 'auto';
    body.style.overflowX = 'hidden';
    body.style.overscrollBehavior = 'auto';

    return () => {
      html.style.height = previous.htmlHeight;
      html.style.overflowX = previous.htmlOverflowX;
      html.style.overflowY = previous.htmlOverflowY;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.height = previous.bodyHeight;
      body.style.minHeight = previous.bodyMinHeight;
      body.style.maxHeight = previous.bodyMaxHeight;
      body.style.overflowX = previous.bodyOverflowX;
      body.style.overflowY = previous.bodyOverflowY;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);

  return null;
}

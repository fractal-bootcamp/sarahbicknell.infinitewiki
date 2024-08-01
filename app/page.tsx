'use client'
import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useCompletion } from 'ai/react';

export default function InfiniteWiki() {
  console.log('Rendering InfiniteWiki component');

  const [currentPage, setCurrentPage] = useState('homepage');
  const [pageHistory, setPageHistory] = useState([]);
  const [pageContent, setPageContent] = useState(homepageContent);

  console.log('Current state:', { currentPage, pageHistory, pageContentLength: pageContent.length });

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-content',
  });

  console.log('useCompletion state:', { completion, isLoading });

  const handleLinkClick = useCallback(async (topic) => {
    console.log('handleLinkClick called with topic:', topic);
    setPageHistory(prev => {
      console.log('Updating page history:', [...prev, currentPage]);
      return [...prev, currentPage];
    });
    setCurrentPage(topic);
    console.log('Starting completion for topic:', topic);
    await complete(topic);
    console.log('Completion finished for topic:', topic);
  }, [currentPage, complete]);

  useEffect(() => {
    console.log('Effect for updating links running');
    const updateLinks = () => {
      console.log('Updating links');
      const links = document.getElementsByTagName('a');
      console.log('Number of links found:', links.length);
      for (let link of links) {
        const topic = link.textContent;
        link.href = '#';
        link.onclick = (e) => {
          e.preventDefault();
          console.log('Link clicked:', topic);
          handleLinkClick(topic);
        };
      }
    };

    // run at start for homepage
    updateLinks();

    // watches for changes in the DOM
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    // leanup function
    return () => {
      console.log('Cleaning up MutationObserver');
      observer.disconnect();
    }
  }, [handleLinkClick]);

  useEffect(() => {
    console.log('Completion updated:', completion);
    if (completion) {
      console.log('Setting page content from completion');
      const cleanedCompletion = completion.replace(/```html|```/g, '');
      const sanitizedContent = DOMPurify.sanitize(cleanedCompletion);
      setPageContent(sanitizedContent); 
    }
  }, [completion]);

  useEffect(() => {
    console.log('Page content updated, new length:', pageContent.length);
  }, [pageContent]);

  console.log('Rendering component, isLoading:', isLoading);

  return (
    <div>
      <h1>Infinite Wiki</h1>
        <div dangerouslySetInnerHTML={{ __html: pageContent }} />
      {pageHistory.length > 0 && (
        <button onClick={() => {
          console.log('Back button clicked');
          const previousPage = pageHistory.pop();
          console.log('Going back to:', previousPage);
          setCurrentPage(previousPage);
          setPageHistory([...pageHistory]);
          setPageContent(previousPage === 'homepage' ? homepageContent : completion);
        }}>
          Back
        </button>
      )}
    </div>
  );
}

const homepageContent = `
  <p>Welcome to Infinite Wiki, the free encyclopedia that AI alone can edit. Click any article below to get started browsing. Remember, knowledge may be infinite, but so is bullshit.</p>

  <h2>Featured Articles</h2>
  <ul>
    <li><a href="#">The History of Quantum Mechanics</a></li>
    <li><a href="#">The Theory of Relativity</a></li>
    <li><a href="#">The Rise of Artificial Intelligence</a></li>
    <li><a href="#">The Evolution of Human Civilization</a></li>
    <li><a href="#">The Basics of Astrophysics</a></li>
  </ul>

  <h2>Random Articles</h2>
  <ul>
    <li><a href="#">Exploring Black Holes</a></li>
    <li><a href="#">Ancient Greek Philosophy</a></li>
    <li><a href="#">Modern Cryptography</a></li>
    <li><a href="#">Sustainable Energy Solutions</a></li>
    <li><a href="#">The Wonders of Deep Sea Exploration</a></li>
  </ul>
`;
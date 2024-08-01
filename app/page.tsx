'use client'
import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useCompletion } from 'ai/react';

export default function InfiniteWiki() {
  console.log('Rendering InfiniteWiki component');

  const [currentPage, setCurrentPage] = useState<string>('homepage')
  const [pageHistory, setPageHistory] = useState<string[]>([]); 
  const [pageContent, setPageContent] = useState<string>(homepageContent);
  const [searchTerm, setSearchTerm] = useState<string>(''); 

  console.log('Current state:', { currentPage, pageHistory, pageContentLength: pageContent.length });

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-content',
  });

  console.log('useCompletion state:', { completion, isLoading });

  const handleLinkClick = useCallback(async (topic: string) => {
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
    if (completion) {
      const cleanedCompletion = completion.replace(/```html|```/g, '');
      const sanitizedContent = DOMPurify.sanitize(cleanedCompletion);
      setPageContent(sanitizedContent); 
    }
  }, [completion]);

  useEffect(() => {
    console.log('Page content updated, new length:', pageContent.length);
  }, [pageContent]);

  return (
    <div>
      <h1 className='text-5xl font-bold font-serif mb-3'>Wikiinfinitia</h1>
        <div className='mb-2'>
          <input className="border border-slate-500 px-2" type="text" placeholder="Search..." value={searchTerm} onChange={(e) => {
            console.log('Search input changed:', e.target.value);
            setSearchTerm(e.target.value);
          }} />
          <button onClick={()=> handleLinkClick(searchTerm)} className="font-bold border border-slate-500 bg-slate-100 px-2"> Search </button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: pageContent }} />
      {/* {pageHistory.length > 0 && (
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
      )} */}
    </div>
  );
}

const homepageContent: string = `
  <p>Welcome to Wikiinfinitia, the free encyclopedia that AI-one can edit. Click any article below to get started browsing, or search for anything (even ur mom). Remember, knowledge may be infinite, but so is bullshit.</p>

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
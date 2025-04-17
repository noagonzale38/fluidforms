// app/error/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router

const ErrorPage = () => {
  const router = useRouter();
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    const generateErrorId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `error_${randomNum}`;
    };

    const storedErrorId = localStorage.getItem('shownErrorId');
    if (storedErrorId) {
      // Redirect if already shown
      router.replace('/');
    } else {
      const newErrorId = generateErrorId();
      setErrorId(newErrorId);
      localStorage.setItem('shownErrorId', newErrorId);
    }
  }, [router]);

  if (!errorId) return null;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Page Failure</h1>
      <p>
        An error has occurred while attempting to run this page. Please contact{' '}
        <a href="mailto:support@fluidforms.com">FluidForms Support</a> for more information.
      </p>
      <strong>Error ID: {errorId}</strong>
    </div>
  );
};

export default ErrorPage;

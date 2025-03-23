import React from "react";
import { Outlet, redirect } from "react-router-dom";
import { Suspense } from "react";
import "./app.css";
import { api } from "@/services/api";
import { User } from "@/types/user";
import { getSession } from "@/lib/supabase";

export const links = () => [
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Roboto:wght@400;700&display=swap" },
  { rel: "icon", href: "@images/syllabai_(white_background).png" },
];

export const meta = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "SyllabAI - Syllabus Analysis" },
];

export const loader = async () => {
  try {
    const session = await getSession();
    if (session) {
      const user = await api.user.getCurrent();
      return { user };
    }
    return { user: null };
  } catch (error) {
    // If there's an error getting the session or user data, treat as not signed in
    return { user: null };
  }
};

export default function App() {
  return (
    <html lang="en" className="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SyllabAI - Syllabus Analysis</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Roboto:wght@400;700&display=swap" />
        <link rel="icon" href="@images/syllabai_(white_background).png" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </body>
    </html>
  );
}

// Custom error boundary component
export function ErrorBoundary() {
  return (
    <html lang="en" className="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - SyllabAI</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Roboto:wght@400;700&display=swap" />
        <link rel="icon" href="@images/syllabai_(white_background).png" />
      </head>
      <body>
        <div className="error-container">
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry, but there was an error loading this page.</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

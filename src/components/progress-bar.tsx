"use client";
import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
  return <AppProgressBar
    // height="2px"
    color="#1ba0f8"
    options={{ showSpinner: false }}
    // shallowRouting
  />
}
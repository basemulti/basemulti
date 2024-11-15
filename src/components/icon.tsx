import React, { Suspense } from 'react';
import dynamic from 'next/dynamic'
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name])

  const fallback = <div className={props?.className} />

  return <Suspense fallback={fallback}>
    <LucideIcon {...props} />
  </Suspense>;
};

export default Icon;
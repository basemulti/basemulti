'use client'

import { BaseType } from '@/lib/types';
import { useSchemaStore } from '@/store/base';
import { useGlobalStore } from '@/store/global';
import React, { useEffect } from 'react';

type AppInitializerPropsType = {
  schema?: any;
  user: any;
  base: BaseType;
  children: React.ReactNode;
}

export default function AppInitializer({ schema = null, base, user, children }: AppInitializerPropsType) {
  const { init } = useSchemaStore(store => ({ init: store.init }));

  useEffect(() => {
    init && init(schema);
  }, [schema]);

  useEffect(() => {
    useGlobalStore.setState({
      user,
      bases: [base],
    });
  }, [user, base]);

  return children
}
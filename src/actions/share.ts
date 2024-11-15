'use server'

import { Share } from "@/database";
import { getCurrentUser } from "@/lib/server";
import { denies, sleep } from "@/lib/utils";

export async function getShare({
  baseId, tableName, viewId, type
}: {
  baseId: string;
  tableName: string;
  viewId?: string;
  type: string;
}) {
  const user = await getCurrentUser();

  // await sleep(2000);

  const base = await user?.getBase(baseId);
  if (!base) {
    return {
      error: 'Base not found'
    }
  }

  const share = await Share.query().where({
    base_id: baseId,
    table_name: tableName,
    view_id: viewId,
    type,
  }).first();

  return {
    share: share ? share?.toData() : null
  };
}

export async function createShare({
  baseId, tableName, viewId, type
}: {
  baseId: string;
  tableName: string;
  viewId?: string;
  type: string;
}) {
  const user = await getCurrentUser();

  const base = await user?.getBase(baseId);
  if (!base) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(base.role, 'view:update')) {
    return {
      error: 'Cannot share view'
    }
  }

  let share = await Share.query().where({
    base_id: baseId,
    table_name: tableName,
    view_id: viewId,
    type,
  }).first();

  if (!share) {
    share = new Share;
    share.base_id = baseId;
    share.table_name = tableName;
    share.view_id = viewId || null;
    share.type = type;
    await share.save();
  }

  return {
    share: share?.toData()
  };
}

export async function deleteShare({
  baseId, tableName, viewId, type
}: {
  baseId: string;
  tableName: string;
  viewId?: string;
  type: string;
}) {
  const user = await getCurrentUser();

  const base = await user?.getBase(baseId);
  if (!base) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(base.role, 'view:update')) {
    return {
      error: 'Cannot share view'
    }
  }

  const share = await Share.query().where({
    base_id: baseId,
    table_name: tableName,
    view_id: viewId,
    type,
  }).first();

  if (share) {
    await share.delete();
  }

  return {};
}

export async function updateShare({
  baseId, tableName, viewId, type
}: {
  baseId: string;
  tableName: string;
  viewId?: string;
  type: string;
}) {
  const user = await getCurrentUser();

  const base = await user?.getBase(baseId);
  if (!base) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(base.role, 'view:update')) {
    return {
      error: 'Cannot share view'
    }
  }

  await Share.query().where({
    base_id: baseId,
    table_name: tableName,
    view_id: viewId,
    type,
  }).delete();

  const share = new Share;
  share.base_id = baseId;
  share.table_name = tableName;
  share.view_id = viewId || null;
  share.type = type;
  await share.save();

  return {
    share: share?.toData()
  };
}
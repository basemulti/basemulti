import { RoleType } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Pivot, HasUniqueIds } from 'sutando';

const PivotWithUniqueIds = HasUniqueIds(Pivot) as typeof Pivot;

export default class Collaborator extends PivotWithUniqueIds {
  table = 'collaborators';
  static idPrefix: string = 'col';

  id!: string;
  user_id!: string;
  collaboratorable_type!: string;
  collaboratorable_id!: string;
  role!: RoleType;

  newUniqueId() {
    // @ts-ignore
    return generateId(this.constructor.idPrefix);
  }
}

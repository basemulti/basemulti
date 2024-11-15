import { generateId } from '@/lib/utils';
import { Model as BaseModel, HasUniqueIds } from 'sutando';

// @ts-ignore
export default class Model extends HasUniqueIds(BaseModel) {
  static idPrefix: string = '';

  created_at!: Date;
  updated_at!: Date;

  newUniqueId() {
    // @ts-ignore
    return generateId(this.constructor.idPrefix);
  }
}
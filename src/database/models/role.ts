import Model from "./model";

export default class Role extends Model {
  table = 'roles';
  static idPrefix: string = 'rle';

  id!: string;
  title!: string;
  description!: string;
}
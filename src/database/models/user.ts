import { getRole, nanoid } from "@/lib/utils";
import { Base, DB } from "..";
import Collaborator from "./collaborator";
import Model from "./model";
import Workspace from "./workspace";
import { RoleType } from "@/lib/types";
import { NewAccessToken, PersonalAccessToken } from "@/lib/keeper";

export default class User extends Model {
  table = 'users';
  static idPrefix: string = 'usr';

  id!: string;
  name!: string;
  email!: string;
  password!: string;

  accessToken!: PersonalAccessToken | null;

  relationWorkspaces() {
    return this.belongsToMany(
      Workspace,
      'collaborators',
      'user_id',
      'collaboratorable_id',
    )
    .setUsing(Collaborator)
    .withPivot('role')
    .withTimestamps()
    .wherePivot('collaboratorable_type', '=', 'workspace');
  }

  relationBase() {
    return this.belongsToMany(
      Base,
      'collaborators',
      'user_id',
      'collaboratorable_id',
    )
    .setUsing(Collaborator)
    .withPivot('role')
    .withTimestamps()
    .wherePivot('collaboratorable_type', '=', 'base');
  }

  static async getWorkspaces(user: User) {
    return await user.getAllWorkspaces();
  }

  async abilities(id: string, type: string) {
    let collaborator = await DB.table('collaborators')
      .where('user_id', this.id)
      .where('collaboratorable_type', type)
      .where('collaboratorable_id', id)
      .first();
    
    if (!collaborator && type === 'base') {
      collaborator = await DB.table('collaborators')
        .join('bases', 'bases.workspace_id', '=', 'collaborators.collaboratorable_id')
        .where('user_id', this.id)
        .where('collaboratorable_type', 'workspace')
        .where('bases.id', id)
        .first();
    }

    return getRole(
      collaborator 
        ? collaborator.role
        : 'no-access'
    );
  }

  relationCollaborators() {
    return this.hasMany(
      // @ts-ignore
      Collaborator,
      'user_id'
    );
  }

  async getWorkspaceOrBase(collaborator: Collaborator) {
    return collaborator.collaboratorable_type === 'workspace'
      ? await this.getWorkspace(collaborator.collaboratorable_id)
      : await this.getBase(collaborator.collaboratorable_id);
  }

  async getWorkspace(id: string) {
    const user = this as User;
    const collaborators = await user.related('collaborators')
      .where(q => q.where({
        collaboratorable_type: 'base',
      })
      .orWhere({
        collaboratorable_type: 'workspace',
        collaboratorable_id: id
      }))
      .get<Collaborator>();

    if (collaborators.count() === 0) {
      return null;
    }

    const roleMap: Record<string, string> = {};
    const baseIds: string[] = [];
    for (let collaborator of collaborators) {
      if (collaborator.collaboratorable_type === 'base') {
        baseIds.push(collaborator.collaboratorable_id);
      }

      roleMap[collaborator.collaboratorable_id] = collaborator.role;
    }

    const workspace = await Workspace.query()
      .with({
        bases: q => {
          q.select('id','label','workspace_id','created_at','updated_at');
          if (!roleMap[id]) {
            q.whereIn('id', baseIds);
          }
        }
      })
      .find(id);

    if (!workspace) {
      return null;
    }
    
    workspace.setAttribute('role', roleMap[workspace.id] ?? 'no-access');
    for (let base of workspace.bases) {
      base.setAttribute('role', roleMap[base.id] ?? roleMap[base.workspace_id] ?? 'no-access');
    }

    return workspace;
  }

  async getAllWorkspaces() {
    const user = this as User;
    const collaborators = await user.related('collaborators').get<Collaborator>();

    const roleMap: Record<string, string> = {};
    const baseIds: string[] = [];
    const workspaceIds: string[] = [];
    for (let collaborator of collaborators) {
      if (collaborator.collaboratorable_type === 'workspace') {
        workspaceIds.push(collaborator.collaboratorable_id);
      }

      if (collaborator.collaboratorable_type === 'base') {
        baseIds.push(collaborator.collaboratorable_id);
      }

      roleMap[collaborator.collaboratorable_id] = collaborator.role;
    }

    const workspaces = (await Workspace.query()
      .with({
        bases: q => {
          q.select('id','label','workspace_id','created_at','updated_at');
          q.whereIn('workspace_id', workspaceIds).orWhereIn('id', baseIds);
        }
      })
      .select('workspaces.*')
      .leftJoin('bases', 'bases.workspace_id', '=', 'workspaces.id')
      .whereIn('bases.id', baseIds)
      .orWhereIn('workspaces.id', workspaceIds)
      .orderBy('workspaces.created_at', 'asc')
      .get())
      .unique();
    
    for (let workspace of workspaces) {
      workspace.setAttribute('role', roleMap[workspace.id] ?? 'no-access');
      for (let base of workspace.bases) {
        base.setAttribute('role', roleMap[base.id] ?? roleMap[base.workspace_id] ?? 'no-access');
      }
    }

    return workspaces;
  }

  async getBase(id: string) {
    const user = this as User;
    const base = await Base.query().find(id);
    if (!base) {
      return null;
    }

    const collaborator = await user.related('collaborators')
      .where(q => q.where({
          collaboratorable_type: 'base',
          collaboratorable_id: id
        })
        .orWhere({
          collaboratorable_type: 'workspace',
          collaboratorable_id: base.workspace_id
        })
      )
      .first<Collaborator>();

    if (!collaborator) {
      return null;
    }

    base.setAttribute('role', collaborator.role);
    return base as Base & {
      role: RoleType
    };
  }

  async getAllBases() {
    const user = this as User;
    const collaborators = await user.related('collaborators').get<Collaborator>();
    
    const roleMap: Record<string, string> = {};
    const baseIds = [];
    const workspaceIds = [];
    for (let collaborator of collaborators) {
      if (collaborator.collaboratorable_type === 'workspace') {
        workspaceIds.push(collaborator.collaboratorable_id);
      }

      if (collaborator.collaboratorable_type === 'base') {
        baseIds.push(collaborator.collaboratorable_id);
      }

      roleMap[collaborator.collaboratorable_id] = collaborator.role;
    }

    const bases = await Base.query()
      // .with('workspace')
      .whereIn('id', baseIds)
      .orWhereIn('workspace_id', workspaceIds)
      .get();
    
    for (let base of bases) {
      base.setAttribute('role', roleMap[base.id] ?? roleMap[base.workspace_id]);
    }

    return bases;
  }

  static async findAuth(token: string) {
    const accessToken = await PersonalAccessToken.findToken(token);

    if (accessToken) {
      const user = await User.query().find(accessToken.tokenable_id);

      if (user) {
        user.withAccessToken(accessToken);
        return user;
      }
    }

    return null;
  }

  relationTokens() {
    return this.hasMany(PersonalAccessToken, 'tokenable_id').where('tokenable_type', 'User');
  }

  tokenCan(ability: string) {
    return this.accessToken && this.accessToken.can(ability);
  }

  async createToken(name: string, abilities: string[] = ['*'], expiresAt = null) {
    const plainTextToken = nanoid(40);
    
    const user = this as User;
    const token = await user.related('tokens').create({
      name: name,
      tokenable_type: 'User',
      token: plainTextToken,
      abilities: JSON.stringify(abilities),
    });

    return new NewAccessToken(token, plainTextToken);
  }

  currentAccessToken() {
    return this.accessToken;
  }

  withAccessToken(accessToken: PersonalAccessToken) {
    this.accessToken = accessToken;

    return this;
  }
}
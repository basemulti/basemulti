import { type Builder, Model } from 'sutando';
import crypto from 'crypto';

export const separator = '.';

class PersonalAccessToken extends Model {
  table = 'personal_access_tokens';
  casts = {
    abilities: 'json',
    last_used_at: 'datetime',
  };

  hidden = [
    'token',
  ];

  declare id: string;
  declare name: string;
  declare token: string;
  declare tokenable_id: string;
  declare abilities: string[];

  tokenable(): Builder<any, any> {
    // @ts-ignore
    return this.morphTo('tokenable');
  }

  static async findToken(token: string) {
    if (!token) {
      return null;
    }
    
    if (token.includes(separator) === false) {
      return await this.query().where('token', token).first();
    }

    const [id, tokenString] = token.split(separator, 2);
    const instance = await this.query().find(id)

    if (instance) {
      return instance.token == crypto.createHash('sha256').update(tokenString).digest('hex') ? instance : null;
    }
  }

  can(ability: string) {
    return this.abilities.includes('*') || this.abilities.includes(ability);
  }

  cant(ability: string) {
    return ! this.can(ability);
  }
}

class NewAccessToken {
  accessToken;
  plainTextToken;

  constructor(accessToken: PersonalAccessToken, plainTextToken: string) {
    this.accessToken = accessToken;
    this.plainTextToken = plainTextToken;
  }

  toData() {
    return {
      accessToken: this.accessToken,
      plainTextToken: this.plainTextToken,
    };
  }

  toJSON() {
    return this.toData();
  }

  toJson(...args: any) {
    return JSON.stringify(this.toData(), ...args);
  }
}

export {
  PersonalAccessToken,
  NewAccessToken,
}
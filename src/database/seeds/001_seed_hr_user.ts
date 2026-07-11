import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('hr_users').del();

  const saltRounds: number = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash: string = await bcrypt.hash(process.env.HR_PASSWORD || 'password', saltRounds);

  // Insert default HR admin user
  await knex('hr_users').insert([
    {
      email: process.env.HR_EMAIL || 'admin@hr.com',
      password_hash: passwordHash,
      name: 'HR Admin',
    },
  ]);
}

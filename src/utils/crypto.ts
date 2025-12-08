import bcrypt from 'bcrypt'

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10) // 10 là cost factor
}
export function comparePassword(password: string, hashed: string) {
  return bcrypt.compareSync(password, hashed)
}

/** Dependencies must be ready before opening the HTTP port. */
export async function initializeServer<T>({
  connect,
  initialize,
  listen
}: {
  connect: () => Promise<unknown>
  initialize: () => Promise<unknown>
  listen: () => T
}): Promise<T> {
  await connect()
  await initialize()
  return listen()
}

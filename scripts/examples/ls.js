export const command = async (_) => {
  cd('..')
  await $`ls -a`
}

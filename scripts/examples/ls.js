export const run = async (_) => {
  cd('..')
  await $`ls -a`
}

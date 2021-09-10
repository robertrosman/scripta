export const command = async (_) => {
  // Note that $ and cd is registered globally by zx. To see what more you have available, check out the zx documentation here: https://github.com/google/zx
  cd('..')
  await $`ls -a`
}

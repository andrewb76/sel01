export const config = () => ({
  env: process.env.NODE_ENV,
  vk: {
    vkToken: process.env.VK_TOKEN,
    confirmationToken: process.env.VK_CONFIRMATION_TOKEN,
    groupId: parseInt(process.env.VK_GROUP_ID),
    secret: process.env.VK_BOT_SECRET,
    port: parseInt(process.env.VK_BOT_PORT),
    cmdPrefix: '/'
  },
  gpt: {
    apiKey: process.env.GPT_API_KEY,
  },
});
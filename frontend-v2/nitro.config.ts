import { defineConfig  } from 'nitro'

export default defineConfig({
  preset: 'aws_amplify',

  awsAmplify: {
    runtime: 'nodejs24.x',
  },
})
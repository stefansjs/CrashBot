# Running Locally

If you're working on developing features for the discord bot, the way to test the bot is by installing into a test 
server and running a local node instance. Here's the instructions.

## Initial Setup

1. Install node.js 
1. create a discord server 
    - Launch Discord
    - click the little "+" button below the list of all servers to "Add a Server"
1. create a discord app and bot
    - go to https://discord.com/developers/applications and click "New Application". follow the instructions
    - Go to the "Installation" section on the left and copy the url
1. Install the app into your development server by going to the install url
1. get your `APP_ID` and `DISCORD_TOKEN` from the discord bot. Populate `.env` in the root of this repository with those values
1. setup a firewall or port forwarding to expose your development server to the internet
    - to use ngrok
      - install ngrok https://ngrok.com/download
      - Create an account with ngrok
1. Run everything with the steps below


## Running for development

1. run the interaction hooks locally by running `npm run start` in a console
1. attach a debugger of your choice. I use VSCode with a node extension that automatically attaches the debugger when I run the above command
1. expose your server to the internet.
    - if you use ngrok like I did, run `ngrok https <port number>` in another console
1. Update the public URL of your server to the discord bot on discord.com/developers/applications
    - if you use ngrok like I did, copy the public URL that ngrok creates to your discord bot configuration
1. profit


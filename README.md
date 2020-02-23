#Pit Panda Production
###Setup
if you want to set this up for your self the files need that are excluded for the project via the .gitignore are
```
/node_modules
/frontEnd/node_modules
.vs/
keys.json
dbLogin.json
```
so you will need to run `npm install` in the main folder and in the frontEnd folder
you will need to create a file called `keys.json` it needs to be an array like this of your hypixel api keys
```
[
    "########-####-####-####-############",
    "########-####-####-####-############"
]
```
and `dbLogin.json` is just a string with the mongo connection uri for the mystic database
`"mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[database][?options]]"` copied from [MongoDB Manual](https://docs.mongodb.com/manual/reference/connection-string/)

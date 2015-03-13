nodeRmongo
-----


# 安裝

### 安裝 mongodb

Reference
[http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo add-apt-repository "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen"
sudo apt-get update
sudo apt-get install mongodb-org
sudo service mongod start
```


### 安裝 R
Reference

[http://cran.csie.ntu.edu.tw/bin/linux/ubuntu/README.html](http://cran.csie.ntu.edu.tw/bin/linux/ubuntu/README.html)

[http://rwepa.blogspot.tw/2013/05/ubuntu-r.html](http://rwepa.blogspot.tw/2013/05/ubuntu-r.html)

check ubuntu ```$ lsb_release -a``` Description:     Ubuntu 12.04 LTS
```bash
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9
$ sudo add-apt-repository "deb http://mirror.bjtu.edu.cn/cran/bin/linux/ubuntu precise/"
$ sudo apt-get update
$ sudo apt-get install r-base r-base-dev
$ sudo R
```

### 安裝R packages
```R
#Rserve part
install.packages("Rserve")

#mongo part
install.packages("RJSONIO")
install.packages("jsonlite")
install.packages("plyr")
install.packages("rmongodb")

#plot graph
install.packages("digest")
install.packages("ggplot2")
```

### 安裝 node.js
Reference

[https://chrislea.com/2013/06/25/getting-debian-packages-sources-from-launchpad/](https://chrislea.com/2013/06/25/getting-debian-packages-sources-from-launchpad/)

```bash
$ sudo add-apt-repository ppa:chris-lea/node.js
$ sudo apt-get update
$ sudo apt-get install nodejs
$ node -v
```

### 使用 git clone 執行 nodeRmongo
```bash
$ sudo apt-get install git
$ git clone https://github.com/kriloBT/nodeSS.git
$ cd nodeSS/nodeRmongo
$ npm install
$ node app

```

### mongodb 準備資料 (prepare data)
user_amount
```bash
$ mongo localhost:27017/test2 "./data/data.js"
```
iris
```bash
$ mongoimport -d rmongodb -c iris --type csv --file "./data/iris.csv" –headerline
```
check exists
```bash
$ mongo test2
> db.c2.find()
> use rmongodb
> db.iris.find()
```


# 
# run 以下為執行區
### mongo @2.6.1

windows
```bash
> mongod
```

linux
```bash
> sudo service mongod start
```

### R @3.1

windows
note:`name` should replace to your username
```bash
> cd "C:/Users/name/Documents/R/win-library/3.1/Rserve/libs/i386"
> R CMD Rserve
```

linux
```bash
> R CMD Rserve
> sudo netstat -ntlp|grep Rserve
```

### node @0.10.28

```bash
> npm install
> node app
```


### browse

 [http://localhost:8000/rmongo/hist](http://localhost:8000/rmongo/hist)
 
 第一次執行有
 Error in ggsave(filename) : plot should be a ggplot2 plot
 
 [http://localhost:8000/rmongo/showHist](http://localhost:8000/rmongo/showHist)
 
 [http://localhost:8000/Rmongo/plot?Rscript=/iris_mongo_plot.R&pngFilename=test2Plot.png](http://localhost:8000/Rmongo/plot?Rscript=/iris_mongo_plot.R&pngFilename=test2Plot.png)
 
 ```bash
 GET /Rmongo/plot?Rscript=/iris_mongo_plot.R&pngFilename=test2Plot.png 200 4ms
 save: /home/user/nodejs/nodeRmongo/routestest2Plot.png 
 ```
 
 [http://localhost:8000/Rmongo/showPlot?filename=test2Plot.png](http://localhost:8000/Rmongo/showPlot?filename=test2Plot.png)
 
 ```bash
load: test3Plot.png
GET /Rmongo/showPlot?filename=test2Plot.png 200 5ms
 ```
 
# function explanation 使用程式碼

![Image](./context.png?raw=true)

### rmongodb

main function|value
---|---
mongo.create([host],[name],[username],[password],[db],[timeout]) |
mongo connection|
mongo.is.connected(mongo)|TRUE
mongo.get.databases(mongo)|
mongo.get.database.collections(mongo,db)|
mongo.insert(mongo,ns,b)|b: mongo.bson
mongo.find.one(mongo, ns, query, fields)|ns: "db.collection"
mongo.find(mongo, ns, query, sort, fields, limit, skip, options)|
mongo.update(mongo, ns, criteria, objNew, flags)|
mongo.remove(mongo, ns, criteria = mongo.bson.empty())|
mongo.drop(mongo, ns)|
mongo.drop.database(mongo, db)|


function|description
---|---
mongo.bson.buffer.append(buf,name,value)| 附加 {name:value} 至 mongo.bson.buffer
mongo.bson.buffer.create()|回傳 new mongo.bson.buffer 用以append data
mongo.bson.from.buffer(buf)|轉型 mongo.bson.buffer 成 bson
mongo.bson.from.JSON('{name:value}')|轉型 JSON 成 bson
mongo.bson.to.list(bson)|轉型 bson 成 R list
mongo.bson.value(bson,name)|回傳 bson 中 name欄位的值
mongo.cursor|回傳 mongo.find()的object 用以iterate取
mongo.cursor.destroy(cursor)|釋放
mongo.cursor.next(cursor)|下一筆
mongo.cursor.value(cursor)|取值
mongo.get.databases(mongo)|回傳 dbs
mongo.get.database.collections(mongo,db)|回傳 db的collections

rmongodb 練習
```R
library(rmongodb);
mongo <- mongo.create();
cursor <-mongo.find(mongo,'test.collection',query='{}');
	res<-NULL;
	while(mongo.cursor.next(cursor)){
		value <-mongo.cursor.value(cursor);
		tmp <- mongo.bson.to.list(value);
		res <-rbind(res,tmp);
	}
	err <- mongo.cursor.destroy(cursor);
```

### ./routes/Rmongo.js


```js
var rio = require('rio');

exports.plot = function (req, res) {
	var pngFilename = req.query.pngFilename;
	var RscriptFilename = req.query.Rscript;
	var RscriptEntryPnt = "createDummyPlot";
	var args = {
		db:'rmongodb',		collection:'iris',
		xdata:'Petal.Length',		ydata:'Petal.Width',
		xlab:'Petal.length',		ylab:'petal.width1'
	};
	
	rio.sourceAndEval(__dirname + RscriptFilename, {
	      	entryPoint: RscriptEntryPnt,
		data: args,
	       	callback: function (err, res) {
			if (!err) {
				fs.writeFile(pngFilename, res, { encoding: "binary" }, function (err) {
					if (!err) 
						console.log("save: " + __dirname + pngFilename);
				});
			} else {
				console.log("Loading image failed");
			}
		}
	});

	res.end();
}

```

## log.js

```r
library(rmongodb);
library(ggplot2);
library(plyr);

mongo<-mongo.create(host = "localhost");
fields = mongo.bson.from.JSON('{\"_id\":1,\"host.ip\":1,\"level\":1,\"message\":1}')

#tmp = mongo.find.one(mongo, ns = "events.events",fields = mongo.bson.from.JSON('{\"_id\":1,\"host.ip\":1,\"level\":1,\"message\":1}'))
tmp = mongo.find.one(mongo, ns = "events.events")

dim(tmp)
#  _id : 7 	 5417eb1c64eae1f02402fae8
#level : 2 	 warn
#timestamp : 9 	 2104387432
#message : 2 	 *****0*****
#  host : 3 	 
#ip : 2 	 172.17.24.102

gameids = data.frame(stringsAsFactors = FALSE)
cursor = mongo.find(mongo, DBNS="events.events") #, fields = mongo.bson.from.JSON('{\"_id\":1,\"host.ip\":1,\"level\":1,\"message\":1}'))

while (mongo.cursor.next(cursor)) {
  tmp = mongo.bson.to.list(mongo.cursor.value(cursor))
  tmp.df = as.data.frame(t(unlist(tmp)), stringsAsFactors = F)
  gameids = rbind.fill(gameids, tmp.df)
}
dim(gameids)

#char 2 numeric 2 datetime
gameids$timestamp <- as.numeric(gameids$timestamp)
gameids$time <- as.POSIXct(gameids$timestamp,origin="1970-01-01")
gameids$hhmmss <- format(as.POSIXct(gameids$timestamp,origin="1970-01-01"),"%H:%M:%S")

class(gameids[2,'time']) #POSIXct/POSIXt 日期格式
class(gameids[2,'hhmmss']) #character 字串

qplot(gameids$time,gameids$host.ip,colour=factor(gameids$level))

ggplot(gameids, aes(time, host.ip, color = factor(level))) +
  geom_point()+
  xlab('time') + ylab('host.ip');
```

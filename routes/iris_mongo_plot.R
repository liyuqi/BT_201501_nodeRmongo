#connect mongo
require('RJSONIO');
library(rmongodb);
mongo <- mongo.create();

#load data
#data(iris)
#head(iris)

#insert2mongo (fail due to num 2 string)
#colnames(iris)[1:4]<-list("slength","swidth","plength","pwidth")
#irislist<-list()
#irislist<-apply(iris,1,function(x) c(irislist,x))
#irisinput <-lapply(irislist,function(x) mongo.bson.from.list(x))
#irisout <- mongo.insert.batch(mongo,"rmongodb.iris",irisinput)

#load from mongo
#cursor <-mongo.find(mongo,"rmongodb.iris",query='{}');

#head(res)
#class(res)

createDummyPlot <- function (obj) {
	mongo <- mongo.create();
	src = fromJSON(obj);
	cursor <-mongo.find(mongo,paste(src['db'],src['collection'],sep='.'),query='{}');
	res<-NULL;
	while(mongo.cursor.next(cursor)){
		value <-mongo.cursor.value(cursor);
		tmp <- mongo.bson.to.list(value);
		res <-rbind(res,tmp);
	}
	err <- mongo.cursor.destroy(cursor);
	print(res[0,]) # _id slen swid plen pwid species
	#print(src['xdata']) #plen
    
	
	filename <- tempfile('testPlot', fileext = '.png')
    png(filename)
	
	#####plot here
    plot(res[,src['xdata']],res[,src['ydata']],xlab=src['xlab'],ylab=src['ylab'])
    dev.off()

    image <- readBin(filename, 'raw', 29999)
    unlink(filename)

    image
}

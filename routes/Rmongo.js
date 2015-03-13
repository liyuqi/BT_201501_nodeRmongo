//### start Rserve ###
//cd C:\Users\liyu\Documents\R\win-library\3.1\Rserve\libs\i386
//R CMD Rserve
var fs = require("fs");
var rio = require("rio");
var test = require("rio");

exports.rio = function (req, res) {
    options = {
        host : "127.0.0.1",
        port : 6311,
        callback: function (err, val) {
            if (!err) {
                console.log("RETURN:" + val);
                return res.send({ 'success': true, 'res': val });
            } else {
                console.log("ERROR:Rserve call failed")
                return res.send({ 'success': false });
            }
        },
    }
    rio.enableDebug(true);//开启调试模式
    rio.evaluate("pi / 2 * 2 * 2", options);//运行R代码
};

exports.formProcess = function () {
    return function (req, res) {
        res.render('formProcess', { title: 'process calc', Switch: 'no', layout: 'l2' });
    };
}

exports.test = function (req, res) {
    options = {
        host : "127.0.0.1",
        port : 6311,
        callback: function (err, val) {
            if (!err) {
                console.log("RETURN:" + val);
                //return
                //res.send({ success: true, res: val });//.toString()
                res.write("AAA</br>")
				
            } else {
                console.log("ERROR:Rserve call failed")
                return res.send({ 'success': false });
            }
        },
    }
    var rcmd = "";
    rcmd = "" 
        + "library(rmongodb);" 
        + "mongo<-mongo.create();" 
        //+ "mongo.is.connected(mongo);"	//res:TRUE
		+ "pipe_a <- mongo.bson.from.JSON('{\"$group\":{\"_id\":\"$userID\", \"total\": {\"$sum\":\"$amount\"}}}');" 
		+ "cmd_lista <- list(pipe_a);" 
        //+ "print(class(cmd_lista));";	//res:mongo.bson
		+ "total <- mongo.aggregation(mongo, 'test2.c1', cmd_lista);" 
        //+ "print(class(total));";	//res:mongo.bson
		+ "ltotal <- mongo.bson.value(total, \"result\");" 
        //+ "print(class(ltotal));";	//res:list
		+ "mtotal <- sapply(ltotal, function(x) return( c(x$'_id',x$total)) );" 
        //+ "print(mtotal);";	//res:matrix
		+ "dtotal <- as.data.frame(t(mtotal));" 
		+ "colnames(dtotal) <- c('userID','amount');" 
        //+ "print(class(dtotal));";
		+ "createDummyPlot <- function () { filename <- tempfile('plot', fileext = '.png'); png(filename);  plot(dtotal);  dev.off(); image <- readBin(filename, 'raw', 29999);  unlink(filename);  image;}";
    
    test.enableDebug(true);//开启调试模式
    test.evaluate(rcmd, options);//运行R代码
};

//node R mongo
var getHist = function (err, res) {
    if (!err) {
		var pngFilename = "testHist.png";	//var pngFilename = param;
        fs.writeFile(pngFilename, res, { encoding: "binary" }, function (err) {
            if (!err) {
            	console.log("save: " + __dirname + pngFilename);
            }
        });
    } else {
        console.log("Loading image failed");
    }
}

exports.hist = function (req, res) {
	var RscriptFilename = "/user_amountPlotColor.R";	//var RscriptFilename = req.body.;
	var RscriptEntryPnt = "createDummyPlot";	//var RscriptEntrypnt = "createDummyPlot";
	
    rio.sourceAndEval(__dirname + RscriptFilename, {
        entryPoint: RscriptEntryPnt,
        callback: getHist
    });
	res.end();
}

exports.showHist = function (req, res) {
	var pngFilename = "testHist.png"; 	//var pngFilename = req.query.filename;
	fs.readFile(pngFilename, res, "binary", function (err, file) {
		if (!err) {
			console.log("load: "+pngFilename);
			res.writeHead(200, { "Content-Type" : "image/png" });
			res.write(file, "binary");
			res.end();
		} else {}
	})
};

var getPlot = function (err, res) {
    if (!err) {
		//var pngFilename = req.query.pngFilename;	
		var pngFilename = "testPlot.png";	
        fs.writeFile(pngFilename, res, { encoding: "binary" }, function (err) {
            if (!err) {
            	console.log("save: " + __dirname + pngFilename);
				//res.writeHead(200, { "Content-Type" : "text/plain" });//TypeError: Object 嚙瞑NG
				//res.write(pngFilename);
            }
        });
    } else {
        console.log("Loading image failed");
		res.writeHead(200, { "Content-Type" : "text/plain" });
		res.write("fail");
    }
}

exports.plot = function (req, res) {
	var pngFilename = req.query.pngFilename;
	var RscriptFilename = req.query.Rscript;	//?Rscript=/iris_mongo_plot.R	//var RscriptFilename = "/iris_mongo_plot.R";
	var RscriptEntryPnt = "createDummyPlot";	//var RscriptEntrypnt = "createDummyPlot";
	var args = {
		db:'rmongodb',
		collection:'iris',
		xdata:'Petal Length',
		ydata:'Petal Width',
		xlab:'Petal.length',
		ylab:'petal.width1'
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

exports.showPlot = function (req, res) {
	var pngFilename = req.query.filename;	//?filename=testPlot.png	//var pngFilename = "testPlot.png"; 
	fs.readFile(pngFilename, res, "binary", function (err, file) {
		if (!err) {
			console.log("load: "+pngFilename);
			res.writeHead(200, { "Content-Type" : "image/png" });
			res.write(file, "binary");
			res.end();
		} else {}
	})
};

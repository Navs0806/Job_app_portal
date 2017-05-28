var express = require('express');
var router = express.Router();
var session = require('express-session');
var sess;

router.get('/addJob', function(req, res){
	sess = req.session;
	if(sess.name != 'admin'){
		res.redirect('/redirects');
	}
	else{
	var jobData = require('../models/jobData');
	jobData.find().then(function(doc){
	    res.render('admin', {style: "/css/admin.css", jobs: doc, addJob: true});
	});
    }
});

router.get('/:jobname', function(req, res){
    sess = req.session;
	if(sess.name != 'admin'){
		res.redirect('/redirects');
	}
	else{
	var jobData = require('../models/jobData');
	jobData.find().then(function(doc){
		var i;
		var flag = false;
		for(i=0; i<doc.length; i++){
			if(req.params.jobname == doc[i].name){
				flag = true;
               break;
			}
		}
		var jobs = doc;
		var job = doc[i];
		if(!flag){
			res.redirect('/redirects');
		}
		else{
			var applicantsData = require('../models/applicantsData');
			applicantsData.find().then(function(doc){
				var flag2 = false;
				var applicantsArray = [];
				for(i=0; i<doc.length; i++){
					if(doc[i].jobname == req.params.jobname && doc[i].status != 'Sorry, your application has been rejected.'){
						var applicant = doc[i];
						if(doc[i].status == 'Congratulations!! Your application has been approved!'){
                            applicant.approval = true;
						}
                       applicantsArray.push(applicant);
                       flag2 = true;
					}
				}
				if(flag2){
                    res.render('admin_job', {style: "/css/admin.css", jobs: jobs, job: job, applications: applicantsArray});
				}
				else{
					res.render('admin_job', {style: "/css/admin.css", jobs: jobs, job: job});
				}               
			});
			
		}


	});
    } 
});

router.post('/:jobname', function(req, res){
   var applicantsData = require('../models/applicantsData');
   applicantsData.find().then(function(doc){
   	for (var i = 0; i < doc.length; i++) {
   		if(doc[i].username == req.body.username && doc[i].jobname == req.params.jobname){
   			doc[i].status = req.body.status;
   			doc[i].save();
   		}
   	}
   	if(req.body.status == 'Congratulations!! Your application has been approved!'){
   		var jobData = require('../models/jobData');
   	    jobData.find().then(function(doc){
   		    for(var i = 0; i < doc.length; i++){
   			   if(doc[i].name == req.params.jobname){
                   doc[i].vacancies--;
                   doc[i].save();
   			   }
   		    }
   	    });
   	}
   });
   res.redirect('back');
});

router.get('/:jobname/edit', function(req, res){
	sess = req.session;
	if(sess.name != 'admin'){
		res.redirect('/redirects');
	}
	else{
		var jobData = require('../models/jobData');
		jobData.find().then(function(doc){
			var flag = false;
			for(var i = 0; i < doc.length; i++){
				if(doc[i].name == req.params.jobname){
                   flag = true;
                   break;
				}
			}
			if(!flag){
				res.redirect('/redirects');
			}
			else{
				res.render('admin_job_edit', {style: "/css/admin.css", jobs: doc, job: doc[i]});
			}
		});
	}
});

router.post('/:jobname/edit', function(req, res){
	var jobData = require('../models/jobData');
	jobData.update(
    { "name": req.params.jobname },
    { "$set": { "name": req.body.name, "description": req.body.description, "requirements": req.body.requirements, "vacancies": req.body.vacancies } },
    function (err, raw) {
        if (err) {
            console.log(err);
        }
         else {
            var applicantsData = require('../models/applicantsData');
            applicantsData.update(
                {"jobname": req.params.jobname},
                {"$set":{"jobname": req.body.name}},
                function(err, raw){
                	if(err){
                		console.log(err);
                	}
                	else{
                		res.redirect('/redirects/admin');
                	}
                }
            );
        }
    }
    );
});

router.get('/:jobname/remove', function(req, res){
	sess = req.session;
	if(sess.name != 'admin'){
		res.redirect('/redirects');
	}
	else{
		var jobData = require('../models/jobData');
		jobData.find().then(function(doc){
			var flag = false;
			for(var i = 0; i < doc.length; i++){
				if(doc[i].name == req.params.jobname){
                   flag = true;
                   break;
				}
			}
			if(!flag){
				res.redirect('/redirects');
			}
			else{
				jobData.remove({name: req.params.jobname}, function(err){
		            res.redirect('/redirects/admin');
				});
			}
		});
	}
});



module.exports = router;
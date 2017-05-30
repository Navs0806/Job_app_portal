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

router.get('/:jobname', function(req, res){ //when the admin clicks on the name of a job
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
				if(flag2){//passing the information of all the applicants for this job
                    res.render('admin_job', {style: "/css/admin.css", jobs: jobs, job: job, applications: applicantsArray});
				}
				else{ //if no one has applied for this job
					res.render('admin_job', {style: "/css/admin.css", jobs: jobs, job: job});
				}               
			});
			
		}


	});
    } 
});

router.post('/:jobname', function(req, res){ //when the admin approves or rejects an application
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
                   doc[i].vacancies--;  //decreasing the number of vacancies if the application is approved
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
		jobData.find().then(function(doc){         //ckecking if /:jobname is a valid path
			var flag = false;
			for(var i = 0; i < doc.length; i++){
				if(doc[i].name == req.params.jobname){
                                      flag = true;
                                       break;
				}
			}
			if(!flag){
				res.redirect('/redirects'); //redirecting f path not valid
			}
			else{     //enabling edit in case of valid path
				res.render('admin_job_edit', {style: "/css/admin.css", jobs: doc, job: doc[i]});
			}
		});
	}
});

router.post('/:jobname/edit', function(req, res){ //when the admin edits details for a job
	var jobData = require('../models/jobData');
	jobData.update(      //updating job data 
    { "name": req.params.jobname },
    { "$set": { "name": req.body.name, "description": req.body.description, "requirements": req.body.requirements, "vacancies": req.body.vacancies } },
    function (err, raw) {
        if (err) {
            console.log(err);
        }
         else {
            var applicantsData = require('../models/applicantsData');
            applicantsData.update(      //updating job name in applicants data
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
		var jobData = require('../models/jobData');  //ckecking if the path is valid by ckecking that 'jobname' is the name of a job in the database
		jobData.find().then(function(doc){
			var flag = false;
			for(var i = 0; i < doc.length; i++){
				if(doc[i].name == req.params.jobname){
                   flag = true;
                   break;
				}
			}
			if(!flag){  //if path is not valid
				res.redirect('/redirects');   
			}
			else{  //removing the job from the database
				jobData.remove({name: req.params.jobname}, function(err){
		            res.redirect('/redirects/admin');
				});
			}
		});
	}
});



module.exports = router;

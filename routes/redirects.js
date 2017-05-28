var express = require('express');
var router = express.Router();
var session = require('express-session');
var sess;


router.get('/', function(req, res){
    sess = req.session;
    if(sess.name){
       res.redirect('/redirects/' + sess.name);
    }
    else{
    	res.redirect('/login');
    }
});

router.get('/admin', function(req, res){
	sess = req.session;
	if(sess.name != 'admin'){
		res.redirect('/redirects');
	}
	else{
	var jobData = require('../models/jobData');
	jobData.find().then(function(doc){
	    res.render('admin', {style: "/css/admin.css", jobs: doc });
	});
    }
});


router.post('/admin', function(req, res){
	var item = {
		name: req.body.name,
		description: req.body.description,
		requirements: req.body.requirements,
        vacancies: req.body.vacancies
	};
	var jobData = require('../models/jobData');
	var job = new jobData(item);
	job.save();
	res.redirect('/redirects/admin');
});

router.get('/:userid', function(req, res){
	sess = req.session;
	if(sess.name == req.params.userid && sess.name != 'admin'){
		var jobData = require('../models/jobData');
		var userData = require('../models/userData');
		var applicantsData = require('../models/applicantsData');
	    userData.find().then(function(doc){
	    	for(var i=0; i<doc.length; i++){
	    		if(doc[i]._id == sess.name){
	    			break;
	    		}
	    	}
	    	var user = doc[i];
	    	var jobs = [];
	    	jobData.find().then(function(doc){
	           var tempJobs = doc;
	           applicantsData.find().then(function(doc){
                   for(var i = 0; i < tempJobs.length; i++){
                   	    var status ='';
                   	   for(var j = 0; j < doc.length; j++){
                   	   	  if(doc[j].username == user.username && doc[j].jobname == tempJobs[i].name){
                              if(doc[j].status == 'Congratulations!! Your application has been approved!'){
                              	status = 'approved';
                              }
                              if(doc[j].status == 'Sorry, your application has been rejected.'){
                              	status = 'rejected';
                              }
                              if(doc[j].status == 'Application sent'){
                              	status = 'applied';
                              }
                   	   	  }
                   	   }
                   	   if(tempJobs[i].vacancies == 0){
                   	   	  status = 'closed0';
                   	   }
                   	    jobs[i] = {
                   	   	  	name: tempJobs[i].name,
                   	   	  	description: tempJobs[i].description,
                   	   	  	requirements: tempJobs[i].requirements,
                            vacancies: tempJobs[i].vacancies,
                            status: status
                   	   	};
                   }
                   res.render('user', {style: "/css/admin.css", jobs: jobs, user:user });
	           });
	       });
	    });
	}
	else{
		res.redirect('/redirects');
	}
});

router.get('/:userid/:jobname', function(req, res){
	sess = req.session;
	if(sess.name != req.params.userid){
       res.redirect('/redirects');
	}
	else{
		var jobData = require('../models/jobData');
		jobData.find().then(function(doc){
			var flag = false;
			for(var i=0 ; i < doc.length; i++){
               if(doc[i].name == req.params.jobname){
               	flag = true;
               	break;
               }
			}
			var job = doc[i];
			var jobs = doc;
			if(!flag){
				res.redirect('/redirects');
			}
			else{
				var userData = require('../models/userData');
				userData.find().then(function(doc){
                    for(var i=0; i<doc.length; i++){
	    		        if(doc[i]._id == sess.name){
	    			       break;
	    		        }
	    	        }
	    	        var user = doc[i];
	    	        var applicantsData = require('../models/applicantsData');
	    	        applicantsData.find().then(function(doc){
	    	        	var flag2 = false;
	    	        	for(var i=0; i<doc.length; i++){
	    	        		if(doc[i].username == user.username && doc[i].jobname == job.name){
                                flag2 = true;
                                res.render('user_job', {style: "/css/admin.css", jobs: jobs, user: user, job: job, disabled: true, status: doc[i].status});
                                break;
	    	        		}
	    	        	}
	    	        	if(!flag2){
                            res.render('user_job', {style: "/css/admin.css", jobs: jobs, user: user, job: job});
	    	        	}
	    	        });
				});
			}
		});
	}

});

router.post('/:userid/:jobname', function(req, res){
   var item = {
   	username: req.body.username,
   	jobname: req.body.jobname,
   	status: 'Application sent'
   };
   var applicantsData = require('../models/applicantsData');
   var applicant = new applicantsData(item);
   applicant.save();
   res.redirect('back');
});

module.exports = router;

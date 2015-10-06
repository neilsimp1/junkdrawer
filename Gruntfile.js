/// <binding BeforeBuild='default' />
module.exports = function(grunt){

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
	,concat: {
      options: {
        separator: ';'
      }
      ,dist: {
        src: [
				'public/js/jquery-1.11.3.min.js'
				,'public/js/bootstrap.min.js'
				,'public/js/jqdl.min.js'
				,'public/js/jd.js'
			]
        ,dest: 'dist/<%= pkg.shortname %>.js'
      }
    }
    ,uglify: {
      build: {
        src: 'dist/<%= pkg.shortname %>.js'
        ,dest: 'dist/<%= pkg.shortname %>.js'
      }
    }
	,copy: {
      main: {
		files: [
		  {expand: true, cwd: 'public/css', src: ['**'], dest: 'build/css'}
		  ,{expand: true, cwd: 'public/fonts', src: ['**'], dest: 'build/fonts'}
		  ,{expand: true, cwd: 'public/js/wysihtml', src: ['**'], dest: 'build/js/wysihtml'}
		  ,{expand: true, cwd: 'public/js', src: ['login.js', 'main.js'], dest: 'build/js'}
		  ,{expand: true, cwd: 'dist', src: ['jd.js'], dest: 'build/js'}
		  ,{expand: true, cwd: 'public/', src: ['favicon.ico'], dest: 'build/'}
		]
	  }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'copy']);

};
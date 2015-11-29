/// <binding BeforeBuild='dev' />
module.exports = function(grunt){

	//config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
		,babel: {
			login: {files: {'dist/login.js': 'make/js/login.js'}}
			,main: {files: {'dist/main.js': 'make/js/main.js'}}
			,jd: {files: {'dist/jd.js': 'make/js/jd.js'}}
			,files: {files: {'dist/files.js': 'make/js/files.js'}}
		}
		,concat: {
			options: {
				separator: ';\r\n'
				,stripBanners: true
			}
			,basic: {
				src: [
						'make/js/jquery-1.11.3.min.js'
						,'make/js/bootstrap.min.js'
						,'dist/jd.js'
					]
				,dest: 'dist/<%= pkg.shortname %>.js'
			}
			,extras: {
				src: [
						'make/js/wysihtml/dist/wysihtml-toolbar.min.js'
						,'make/js/wysihtml/parser_rules/advanced_and_extended.js'
						,'dist/files.js'
						,'dist/main.js'
					]
				,dest: 'dist/main.js'
			}
			//TODO: css concat here
		}
		,uglify: {
			login: {
				src: 'make/js/login.js'
				,dest: 'dist/login.js'
			}
			,basic: {
				src: 'dist/<%= pkg.shortname %>.js'
				,dest: 'dist/<%= pkg.shortname %>.js'
			}
			,extras: {
				src: 'dist/main.js'
				,dest: 'dist/main.js'
			}
		}
		,copy: {
			main: {
				files: [
					//local
					{expand: true, cwd: 'dist', src: ['<%= pkg.shortname %>.js', 'main.js', 'login.js'], dest: 'public/js'}
					//TODO: copy css files

					////publish
					//,{expand: true, cwd: 'public/css', src: ['**'], dest: 'build/css'}
					//,{expand: true, cwd: 'public/fonts', src: ['**'], dest: 'build/fonts'}
					//,{expand: true, cwd: 'dist', src: ['<%= pkg.shortname %>.js', 'app.js'], dest: 'build/js'}
					//,{expand: true, cwd: 'dist', src: ['jd.js'], dest: 'build/js'}
					//,{expand: true, cwd: 'public/', src: ['favicon.ico'], dest: 'build/'}
					//TODO: this ^^^
				]
			}
		}
		,clean: {dist: ['dist/*']}
	});

	//load plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
  
	//run tasks
	grunt.registerTask('dev', ['babel', 'concat', 'copy', 'clean']);
	grunt.registerTask('prod', ['babel', 'concat', 'uglify', 'copy', 'clean']);

};
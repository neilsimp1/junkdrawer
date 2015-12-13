/// <binding BeforeBuild='dev' />
module.exports = function(grunt){

	//config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
		,babel: {
			login: {files: {'dist/login.js': 'src/js/login.js'}}
			,main: {files: {'dist/main.js': 'src/js/main.js'}}
			,jd: {files: {'dist/jd.js': 'src/js/jd.js'}}
			,files: {files: {'dist/files.js': 'src/js/files.js'}}
		}
		,sass: {
			options: {sourcemap: 'none'}
			,dist: {
				files: {
					'dist/jd.css' : 'src/sass/jd.scss'
					,'dist/wysihtml.css' : 'src/sass/wysihtml.scss'
				}
			}
		}
		,concat: {
			options: {
				separator: ';\r\n'
				,stripBanners: true
			}
			,basic: {
				src: [
						'src/js/jquery-1.11.3.min.js'
						,'src/js/bootstrap.min.js'
						,'dist/jd.js'
					], dest: 'dist/<%= pkg.shortname %>.js'
			}
			,extras: {
				src: [
					'src/js/wysihtml/dist/wysihtml-toolbar.min.js'
					,'src/js/wysihtml/parser_rules/advanced_and_extended.js'
					,'dist/files.js'
					,'dist/main.js'
				], dest: 'dist/main.js'
			}
			,css: {
				src: [
					'src/css/bootstrap.min.css'
					,'src/css/bootstrap-theme.min.css'
					,'dist/jd.css'
				], dest :'dist/jd.css'
			}
		}
		,uglify: {
			login: {
				src: 'src/js/login.js'
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
		,cssmin: {
			options: {sourceMap: false}
			,jd: {
				src: 'dist/jd.css'
				,dest: 'dist/jd.css'
			}
			,wysihtml: {
				src: 'dist/wysihtml.css'
				,dest: 'dist/wysihtml.css'
			}
		}
		,copy: {
			main: {
				files: [
					//local
					{expand: true, cwd: 'dist', src: ['<%= pkg.shortname %>.js', 'main.js', 'login.js'], dest: 'public/js'}
					,{expand: true, cwd: 'dist', src: ['<%= pkg.shortname %>.css', 'wysyhtml.css'], dest: 'public/css'}
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
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
  
	//run tasks
	grunt.registerTask('dev', ['babel', 'sass', 'concat', 'cssmin', 'copy', 'clean']);
	grunt.registerTask('prod', ['babel', 'concat', 'uglify', 'cssmin', 'copy', 'clean']);

};
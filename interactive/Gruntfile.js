module.exports = function(grunt) {
    grunt.initConfig({

        sass: {
            interactive: {
                files : {
                    'src/css/main.css' : 'src/scss/main.scss'
                }
            }
        },
        watch: {
            css: {
                files: 'src/css/*',
                tasks: ['copy:css']
            },
            html: {
                files: 'src/index.html',
                tasks: ['copy:html']
            },
            js: {
                files: 'src/js/*',
                tasks: ['shell:interactive']
            },
            renderer: {
                files: 'src/renderer/*',
                tasks: ['shell:render', 'copy:html']
            }
        },
        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 8000,
                    base: 'build'
                }
            }
        },
        copy: {
        	html: {
        		files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['index.html'],
                        dest: 'build/'
                    }
                ]
        	},
            css: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['css/*'], dest: 'build/'
                    }
                ]
            }
        },
        shell: {
        	interactive: {
        		 command: './node_modules/.bin/jspm bundle-sfx src/js/client.js build/js/client.js'
        	},
            render: {
                command: 'node_modules/.bin/babel-node maps.js --presets es2015',
                options: {
                        execOptions: {
                        cwd: 'src/renderer'
                    }
                }
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-sass')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-shell')
    grunt.registerTask('default', ['connect', 'watch'])
}
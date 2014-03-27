module.exports = function(grunt) {
  //grunt plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-recess');
  
  //config
  grunt.initConfig({
    connect: {
      options: {
        host: 'localhost',
        port: 8888
      },
      server: {
        options: {
          base: 'dist',
          open: {
            target: 'http://localhost:<%= connect.options.port %>'
          }
        }
      }
    },

    concat: {
      funnel: {
        src: ['src/js/plugin/**/*.*'],
        dest: 'dist/Dropdown.js'
      },
      app: {
        src: ['src/js/app/**/*.*'],
        dest: 'dist/app.js'
      }
    },

    recess: {
      less: {
        options: { compile: true },
        src: ['src/less/style.less'],
        dest: 'dist/style.css'
      }
    },

    watch: {
      css: {
        files: ['src/**/*.*', 'dist/index.html'],
        tasks: ['recess:less', 'concat'],
        options: {
          livereload: {
            port: 8001,
            // keepalive: true,
            // you can pass in any other options you'd like to the https server, as listed here: http://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
          }
        }
      }
    }
  });

  grunt.registerTask('server', [
    'connect:server',
    'watch',
    ]);
}
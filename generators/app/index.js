/**
 * Created by Fred Lackey <fred.lackey@gmail.com> on 9/23/2015.
 */

var generators      = require('yeoman-generator'),
    fs              = require('fs'),
    path            = require('path'),
    schemaReader    = require('mssql-schema-reader');

var CONFIG_FILE_NAME = 'settings.json',
    OUTPUT_FOLDER    = 'schemas',
    INFO_FILE_NAME   = 'schema-info.json',
    SCHEMA_FILE_NAME = 'schema.json',
    MESSAGES = {
        GOODBYE: {
            FAIL: [
                ' ',
                'Having difficulties?  Check out the GitHub repo for help:',
                'https://github.com/FredLackey/generator-mssql-schema',
                'Really stuck?  Send me the DB\'s create script.  I\'ll try to help:',
                'Fred Lackey <fred.lackey@gmail.com>'
                ],
            SUCCESS: [
                ' ',
                'Thanks for using MSSQL Schema Generator.  =)',
                'Look for my MSSQL-to-MongoDB API Gererator (coming soon)!',
                'Fred Lackey <fred.lackey@gmail.com>'
            ]
        }
    };

var success = false;

module.exports = generators.Base.extend({

    initializing: function () {
        var done = this.async();

        var logger = this.log;

        var defaults = {
            server          : 'localhost',
            user            : 'sa',
            pass            : 'sa',
            db              : 'Northwind',
            encrypt         : 'n',
            folder          : '.',
            oldversions     : 'y',
        };

        var settings = null;

        if (fs.existsSync(CONFIG_FILE_NAME)) {
            var fileData = fs.readFileSync(CONFIG_FILE_NAME, 'utf8');
            try {
                settings = JSON.parse(fileData);
            } catch (ex) {
                logger('Problem reading existing settings file: ' + ex.message);
            }
        }

        settings = settings || {};

        settings.server = settings.server || defaults.server;
        settings.user = settings.user || defaults.user;
        settings.pass = settings.pass || defaults.pass;
        settings.db = settings.db || defaults.db;
        settings.encrypt = settings.encrypt || defaults.encrypt;
        settings.folder = settings.folder || defaults.folder;
        settings.oldversions = settings.oldversions || defaults.oldversions;

        settings.encrypt = (settings.encrypt == 'y') ? 0 : 1;
        settings.oldversions = (settings.oldversions == 'y') ? 0 : 1;

        this.settings = settings;

        done();
    },

    prompting: function () {
        var done = this.async();

        var logger = this.log;

        var prompts = [
            {
                type    : 'input',
                name    : 'server',
                message : 'Server Name',
                default : this.settings.server
            },
            {
                type    : 'input',
                name    : 'user',
                message : 'User Name',
                default : this.settings.user
            },
            {
                type    : 'password',
                name    : 'pass',
                message : 'Password',
                default : this.settings.pass
            },
            {
                type    : 'input',
                name    : 'db',
                message : 'Database',
                default : this.settings.db
            },
            {
                type    : 'expand',
                name    : 'encrypt',
                message : 'Use encrypted connection',
                choices : [
                        { key: "y", name: "Yes. (Required for Azure)", value: "y" },
                        { key: "n", name: "No.", value: "n" },
                    ],
                default : this.settings.encrypt
            },
            {
                type    : 'input',
                name    : 'folder',
                message : 'Output Folder',
                default : this.settings.folder,
            },
            {
                type    : 'expand',
                name    : 'oldversions',
                message : 'Retain old versions',
                choices : [
                        { key: "y", name: "Yes, keep a copy of old schema files.", value: "y" },
                        { key: "n", name: "No, overwrite the schema file each time.", value: "n" },
                    ],
                default : this.settings.oldversions
            }
        ];

        this.prompt(prompts, function (answers) {
            this.answers = answers;
            done();
        }.bind(this));
    },

    configuring: function () {
        var done = this.async();

        var logger = this.log;

        fs.writeFile(CONFIG_FILE_NAME, JSON.stringify(this.answers, null, 4), function (err, fsData) {
            if (err) { throw err; }
        });

        var username = this.answers.user, 
            password = this.answers.pass, 
            server   = this.answers.server, 
            database = this.answers.db, 
            encrypt  = (this.answers.encrypt == 'y' ? true : false);

        // createConfig = function (username, password, server, database, encrypt)
        var dbConfig = schemaReader.createConfig(username, password, server, database, encrypt)
        this.settings.dbConfig = dbConfig;

        if (this.answers.folder == '.' || this.answers.folder == './' || this.answers.folder.toLowerCase() == OUTPUT_FOLDER) {
            this.settings.folderPath = path.join('./', OUTPUT_FOLDER);
        } else {
            this.settings.folderPath = path.join('./', this.answers.folder);
        }

        this.settings.saveLastVersion = (this.answers.oldversions == 'y' ? true : false);

        done();
    },

    default: function () {

    },

    writing: function () {
        var done = this.async();

        var logger = this.log;
        var sayCount = 0;
        var say = function (line) {
            if (sayCount < 1) {
                sayCount++;
                logger(' ');
            }
            logger(line);
        };
        var byeGood = function () {
            MESSAGES.GOODBYE.SUCCESS.forEach(function (line) {
                say(line);
            })
        }
        var byeBad = function () {
            MESSAGES.GOODBYE.FAIL.forEach(function (line) {
                say(line);
            })
        }

        var config          = this.settings.dbConfig,
            infoFilePath    = path.join(this.settings.folderPath, INFO_FILE_NAME),
            saveLastVersion = this.settings.saveLastVersion,
            schemaFilePath  = path.join(this.settings.folderPath, SCHEMA_FILE_NAME);

        if (!fs.existsSync(this.settings.folderPath)) {
            say('Creating output folder...');
            fs.mkdirSync(this.settings.folderPath);
            if (!fs.existsSync(this.settings.folderPath)) {
                throw new Error('Output folder not created: ' + this.settings.folderPath);
            }
        }

        say('Fetching raw information from server...');

        // fromServerToDiskRaw = function (config, filePath, saveLastVersion, callback)
        schemaReader.schema.fromServerToDisk(config, infoFilePath, saveLastVersion, function (err, schemaDoc) {
            if (err) { say('Problem fetching info from server: ' + err.message); byeBad() }
            else if (!schemaDoc) { say('No info returned from server.'); byeBad() }
            else {
                var msg = 'Generating schema document';
                say((saveLastVersion ? (msg += ' (saving last version)...') : (msg += '...')));
                fs.writeFile(schemaFilePath, JSON.stringify(schemaDoc, null, 4), function (err, fsData) {
                    if (err) { say('Error saving schema file: ' + err.message); byeBad() }
                    else { 
                        say('Process completed successfully.'); 
                        byeGood();
                    }
                });
            }
        })

        done();
    },

    conflicts: function () {

    },

    install: function () {

    },

    end: function () {

    }
});
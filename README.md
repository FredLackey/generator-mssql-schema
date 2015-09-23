# Microsoft SQL Server Schema Generator (generator-mssql-schema)
Exports the layout of a Microsoft SQL Server database to a JSON schema document.  Essentially, a CLI for the Microsoft SQL Server Schema Reader module.

# Author & Usage #
As I move from the Microsoft & .NET world to open source and MEAN Stack, there are certain "creature comforts" I cannot live without.  One of those is a model-first (or domain-first) code generator.  For this to exist we must have a way to expose the database's schema programmatically.  This is why I created the **Microsoft SQL Server Schema Reader (mssql-schema-reader)** module.  The actual code generator will eventually come however, in the meantime, we need a way to execute the Schema Reader.  That is where the **Microsoft SQL Server Schema Generator** enters the picture.  This Generator provides a simple CLI to the Microsoft SQL Server Schema Reader as well as providing a Yeoman harness for use by the forthcoming **MSSQL-to-MongoDB API Gererator**.

Thanks,  
Fred Lackey  
[fred.lackey@gmail.com](mailto://fred.lackey@gmail.com "fred.lackey@gmail.com")

----

# Requirements & Limitations #
Please refer to the [Microsoft SQL Server Schema Reader](https://github.com/FredLackey/mssql-schema-reader) for complete requirements & limitations.


> **Important:**  
> **This tool is meant to be used in a development environment where security is not a concern.  This is why the decision was made to store the password as clear text in the `settings.json` file.**

# Installation #
This generator was built for Yeoman, therefore the install command shall be...

`npm isntall -g yo generator-mssql-schema`

# Files & Folders #
Each run of the generator will create the following files and folders:

    /  
    |-- settings.json                    Saved settings.
    |--/schemas                          Data directory.
       |-- schema.json                   Current layout of the database.
       |-- schema-info.json              Current raw data from the database.
       |-- TestDB-1443046679-info.json   Previous version of raw data.
       |-- TestDB-1443046841-info.json   An even older version of the raw data.
       |-- TestDB-1443046855-info.json   Really old version of the raw data.

# Enhancement & Full API Generator #
Keep in mind this generator was written as part of a bigger API generator.  It is far from complete.  In fact, if you are reading this, the first version of the generator is what you're seeing.  Please let me know how *you* need it to function.  I'll be happy to consider enhancements as I add to it.

Have a great day.  =)

Thanks,  
Fred Lackey  
[fred.lackey@gmail.com](mailto://fred.lackey@gmail.com "fred.lackey@gmail.com")

----

Last updated: 9/23/2015 7:48:26 PM 
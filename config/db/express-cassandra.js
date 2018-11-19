var cassandraDriver = require('cassandra-driver');
var models = require('express-cassandra');
var path = require('path');

//Tell express-cassandra to use the models-directory, and
//use bind() to load the models using cassandra configurations.
models.setDirectory(path.join( __dirname, './../../models')).bind(
    {
        clientOptions: {
            contactPoints: JSON.parse(process.env.CASSANDRA_URL),
            keyspace: process.env.DB,
            queryOptions: { consistency: models.consistencies.quorum }
        },
        ormOptions: {
            defaultReplicationStrategy : {
                class: 'SimpleStrategy',
                replication_factor: 1
            },
            migration: 'safe'
        }
    },
    function(err) {
        if(err) throw err;
        var params = [10];
        models.instance.Users.execute_query('select * from system.local limit ?', params, function(error, info){
            if(error) throw error;
            // console.log('All DB Host name: ' + JSON.parse(process.env.CASSANDRA_URL));
            // console.log('Conneted Host name: ' + info.rows[0].broadcast_address);
        });
    }
);

module.exports = {models};

"""
db_connect_util.py

This module provides utility functions for connecting to mongodb server
"""

import os
import pymongo.database
from pymongo.collection import Collection
from util.logging_util import logger
import yaml
from pymongo import MongoClient


def connect_to_mongodb_server(connection_string: str) -> MongoClient:
    """
        Establishes a connection to a MongoDB server using the provided connection string.

        This function attempts to create a MongoDB client and verifies the connection
        by issuing a 'ping' command to the MongoDB server. Logs the success or failure
        of the connection.

        Args:
            connection_string (str): The connection string to use for connecting to the MongoDB server.

        Returns:
            MongoClient: A MongoDB client instance for interacting with the server.

        Raises:
            Exception: If the connection to the MongoDB server fails.

        Example:
            >>> client = connect_to_mongodb_server("mongodb://username:password@host:port/")
            >>> db = client["example_database"]
        """

    try:
        client = MongoClient(connection_string)
        client.admin.command('ping')
        logger().info("connected to mongodb server successfully")
    except Exception as e:
        logger().exception("Failed to connect to the Mongodb server")
        raise
    return client


def connect_to_mongodb_cluster() -> pymongo.database.Database:
    """
    Establishes a connection to a MongoDB cluster and retrieves the specified database.

    This function reads the MongoDB configuration from a YAML file (`database_config.yaml`),
    which includes the username, password, database name, and host. It creates a MongoDB client
    instance using these properties, verifies the connection to the cluster by issuing a `ping`
    command, and ensures that the specified database exists on the server.

    If the connection is successful and the database exists, it returns the `Database` object.
    Otherwise, it raises appropriate exceptions for missing configurations or connection issues.

    Returns:
        pymongo.database.Database: A `Database` object for interacting with the specified MongoDB database.

    Raises:
        FileNotFoundError: If the configuration file is not found.
        KeyError: If required fields (e.g., `username`, `password`, `host`, `database`) are missing
                  from the configuration file.
        ValueError: If the connection to the cluster succeeds but the specified database does not exist.
        Exception: If the connection to the MongoDB cluster fails for any other reason.

    Example:
        >>> db = connect_to_mongodb_cluster()
        >>> print(db.list_collection_names())
        # Output: A list of collections in the specified database.
    """

    config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'database_config.yaml')
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)

    mongodb_server_config = config['mongodb']['server']
    username = mongodb_server_config['username']
    password = mongodb_server_config['password']
    database = mongodb_server_config['database']
    host = mongodb_server_config['host']

    try:
        client = MongoClient(
            f"mongodb+srv://{host}",
            username=username,
            password=password,
            retryWrites=True,
            w="majority"
        )
        client.admin.command('ping')
        logger().info("connected to mongodb server successfully")
        if database not in client.list_database_names():
            raise ValueError(f"connected to mongodb server but the specified database {database} does not exist")
        logger().info(f"connected to the database {database}  successfully")
        return client[database]
    except FileNotFoundError as e:
        logger().exception(f"Configuration file not found. config file : {config_path}")
        raise
    except KeyError as e:
        logger().exception("Missing required configuration fields")
        raise
    except Exception as e:
        logger().exception("Failed to connect to the Mongodb cluster")
        raise


def get_collection(db: pymongo.database.Database, collection_name: str) -> Collection:
    """
        Retrieves a specific collection from a MongoDB database.

        Args:
            db (pymongo.database.Database): The MongoDB database instance.
            collection_name (str): The name of the collection to retrieve.

        Returns:
            Collection: The MongoDB collection object.

        Raises:
            ValueError: If the specified collection does not exist in the database.

        Example:
            >>> db = pymongo.MongoClient().my_database
            >>> collection = get_collection(db, "my_collection")
        """
    if collection_name in db.list_collection_names():
        return db.get_collection(collection_name)
    else:
        raise ValueError(f"could not find name collection {collection_name} in {db.name}")

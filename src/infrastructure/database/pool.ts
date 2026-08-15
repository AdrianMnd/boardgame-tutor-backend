import { Pool } from "pg";

import type { DatabaseConfiguration } from "../../config/database";

export function createPool(

    configuration: DatabaseConfiguration

): Pool {

    return new Pool({

        connectionString: configuration.connectionString

    });

}

import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    WITH unnested_roles AS (
      SELECT
        id
        , CASE WHEN "role" = 'dept_admin' THEN 'department_admin'
               ELSE "role"
          END AS transformed_role
      FROM
        "users"
        , unnest(roles) AS "role"
      WHERE
        roles IS NOT NULL
    )
    , aggregated_updated_roles AS (
      SELECT
        id
        , array_agg(transformed_role) AS roles
      FROM
        unnested_roles
      GROUP BY
        id
    )
    UPDATE
      "users"
    SET
      roles = aggregated_updated_roles.roles
    FROM
      aggregated_updated_roles
    WHERE
      "users".id = aggregated_updated_roles.id
      AND "users".roles IS NOT NULL;
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    WITH unnested_roles AS (
      SELECT
        id
        , CASE WHEN "role" = 'department_admin' THEN 'dept_admin'
               ELSE "role"
          END AS transformed_role
      FROM
        "users"
        , unnest(roles) AS "role"
      WHERE
        roles IS NOT NULL
    )
    , aggregated_updated_roles AS (
      SELECT
        id
        , array_agg(transformed_role) AS roles
      FROM
        unnested_roles
      GROUP BY
        id)
    UPDATE
      "users"
    SET
      roles = aggregated_updated_roles.roles
    FROM
      aggregated_updated_roles
    WHERE
      "users".id = aggregated_updated_roles.id
      AND "users".roles IS NOT NULL;
  `)
}

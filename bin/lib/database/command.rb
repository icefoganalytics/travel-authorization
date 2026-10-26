module Database
  class Command
    def self.call(action, backup_path, project_root:, compose_options:, environment:)
      command = new(project_root:, compose_options:, environment:)
      command.public_send(action, File.expand_path(backup_path))
    end

    def initialize(project_root:, compose_options:, environment:)
      @project_root = project_root
      @compose_options = compose_options
      @environment = environment
    end

    def export(path)
      script = <<~SH
        export PGPASSWORD="$POSTGRES_PASSWORD"
        exec pg_dump --format=custom --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"
      SH

      run(script, out: [path, "wb", 0600])
      puts "Exported development database to #{path}."
    end

    def import(path)
      script = <<~SH
        export PGPASSWORD="$POSTGRES_PASSWORD"
        dropdb --username="$POSTGRES_USER" -- "$POSTGRES_DB"
        createdb --username="$POSTGRES_USER" --template=template0 -- "$POSTGRES_DB"
        exec pg_restore --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" \
          --no-owner --exit-on-error --single-transaction
      SH

      run(script, in: path)
      puts "Imported #{path} into the development database."
    end

    private

    def run(script, **options)
      success = system(
        @environment,
        *%w[docker compose],
        *@compose_options,
        *%w[exec -T db sh -ec],
        script,
        chdir: @project_root,
        **options
      )
      exit($?.exitstatus || 1) unless success
    end
  end
end

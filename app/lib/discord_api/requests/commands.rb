# frozen_string_literal: true

module DiscordApi
  module Requests
    module Commands
      def fetch_commands(application_id:)
        get(
          path: "api/v10/applications/#{application_id}/commands",
          headers: headers
        )
      end

      def add_command(application_id:, params:)
        post(
          path: "api/v10/applications/#{application_id}/commands",
          body: params,
          headers: headers
        )
      end

      def remove_command(application_id:, command_id:)
        delete(
          path: "api/v10/applications/#{application_id}/commands/#{command_id}",
          headers: headers
        )
      end
    end
  end
end

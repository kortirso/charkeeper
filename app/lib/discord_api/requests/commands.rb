# frozen_string_literal: true

module DiscordApi
  module Requests
    module Commands
      def add_command(params:)
        post(
          path: "api/v10/applications/1408454100642955296/commands",
          body: params,
          headers: headers
        )
      end
    end
  end
end

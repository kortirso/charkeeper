# frozen_string_literal: true

module DiscordApi
  module Requests
    module Commands
      def add_command(channel_id:, params:)
        post(
          path: "api/v10/applications/#{channel_id}/commands",
          body: params,
          headers: headers
        )
      end
    end
  end
end

# frozen_string_literal: true

module DiscordApi
  module Requests
    module Interactions
      def send_callback(interaction_id:, interaction_token:, params:)
        post(
          path: "api/v10/interactions/#{interaction_id}/#{interaction_token}/callback",
          body: params,
          headers: headers
        )
      end
    end
  end
end

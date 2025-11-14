# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeCommunityCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_community

        params do
          required(:community).filled(type?: ::Daggerheart::Homebrew::Community)
          required(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        input[:community].update!(input.slice(:name))

        refresh_user_data.call(user: input[:community].user) if input[:community].user

        { result: input[:community] }
      end
    end
  end
end

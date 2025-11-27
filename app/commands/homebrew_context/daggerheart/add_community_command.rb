# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddCommunityCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_community

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Community.create!(input)

        refresh_user_data.call(user: input[:user])

        { result: result }
      end
    end
  end
end

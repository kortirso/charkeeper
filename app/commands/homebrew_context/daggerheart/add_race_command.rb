# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddRaceCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
          optional(:no_refresh).filled(:bool)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Race.create!(input.except(:no_refresh))

        refresh_user_data.call(user: input[:user]) unless input.key?(:no_refresh)

        { result: result }
      end
    end
  end
end

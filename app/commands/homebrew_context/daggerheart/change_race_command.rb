# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeRaceCommand < BaseCommand
      include Deps[
        refresh_user_data: 'services.homebrews_context.refresh_user_data'
      ]

      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:ancestry).filled(type?: ::Daggerheart::Homebrew::Race)
          required(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:ancestry].update!(input.slice(:name, :public))

        refresh_user_data.call(user: input[:ancestry].user) if input[:ancestry].user

        { result: input[:ancestry] }
      end
    end
  end
end

# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeRaceCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:ancestry).filled(type?: ::Daggerheart::Homebrew::Race)
          optional(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:ancestry].update!(input.slice(:name, :public))

        { result: input[:ancestry] }
      end
    end
  end
end

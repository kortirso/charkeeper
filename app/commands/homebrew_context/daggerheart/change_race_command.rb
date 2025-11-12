# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class ChangeRaceCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:ancestry).filled(type?: ::Daggerheart::Homebrew::Race)
          required(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        input[:ancestry].update!(input.slice(:name))

        { result: input[:ancestry] }
      end
    end
  end
end

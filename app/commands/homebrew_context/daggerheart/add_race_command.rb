# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddRaceCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Race.create!(input)

        { result: result }
      end
    end
  end
end

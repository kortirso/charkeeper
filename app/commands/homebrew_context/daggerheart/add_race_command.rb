# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddRaceCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string)
          # required(:domains).filled(:array)
        end

        # rule(:domains) do
        #   next key.failure(:only_two) if value.size != 2

        #   key.failure(:invalid_value) if (value - ::Daggerheart::Character.domains.keys).any?
        # end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Race.create!(input)
        input[:user].homebrews.create!(brewery: result)

        { result: result }
      end
    end
  end
end

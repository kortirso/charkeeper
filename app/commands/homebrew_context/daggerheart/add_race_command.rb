# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddRaceCommand < BaseCommand
      include Deps[cache: 'cache.daggerheart_names']

      use_contract do
        config.messages.namespace = :homebrew_race

        params do
          required(:user).filled(type?: ::User)
          required(:name).filled(:string, max_size?: 50)
          optional(:public).filled(:bool)
        end
      end

      private

      def do_persist(input)
        result = ::Daggerheart::Homebrew::Race.create!(input)

        cache.push_item(key: :ancestries, item: result)

        { result: result }
      end
    end
  end
end

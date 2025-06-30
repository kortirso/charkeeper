# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeEnergyCommand < BaseCommand
      use_contract do
        Rests = Dry::Types['strict.string'].enum('short', 'long', 'session')

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:value).filled(Rests)
        end
      end

      private

      def do_prepare(input)
        refresh_energy_slugs =
          ::Daggerheart::Character::Feature
            .where(slug: input[:character].data.energy.keys, limit_refresh: limit_refresh(input))
            .pluck(:slug)
        input[:character].data.energy.merge!(refresh_energy_slugs.index_with { 0 })
      end

      def do_persist(input)
        input[:character].save!

        { result: input[:character] }
      end

      def limit_refresh(input)
        case input[:value]
        when 'long' then %w[short_rest long_rest]
        when 'short' then 'short_rest'
        when 'session' then 'session'
        end
      end
    end
  end
end

# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class MakeShortRestCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd5::Character)
        end
      end

      private

      def do_prepare(input)
        input[:refresh_energy_slugs] =
          ::Dnd5::Character::Feature
            .where(slug: input[:character].data.energy.keys, limit_refresh: 'short_rest')
            .pluck(:slug)
      end

      def do_persist(input)
        input[:character].data.energy.merge!(input[:refresh_energy_slugs].index_with { 0 })
        input[:character].save!

        { result: :ok }
      end
    end
  end
end

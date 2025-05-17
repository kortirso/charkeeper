# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class MakeShortRestCommand < CharactersContext::Dnd5::MakeShortRestCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Dnd2024::Character)
        end
      end

      private

      def do_prepare(input)
        input[:refresh_energy_slugs] =
          ::Dnd2024::Character::Feature
            .where(slug: input[:character].data.energy.keys, limit_refresh: 'short_rest')
            .pluck(:slug)
        # input[:refresh_one_energy_slugs] =
        #   ::Dnd2024::Character::Feature
        #     .where(slug: input[:character].data.energy.keys, limit_refresh: 'one_at_short_rest')
        #     .pluck(:slug)
      end
    end
  end
end

# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class SpellAddCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd2024::Character)
          required(:spell).filled(type?: ::Dnd2024::Spell)
          required(:target_spell_class).filled(:string)
        end
      end

      private

      def do_persist(input)
        result = ::Dnd2024::Character::Spell.create!(
          character: input[:character],
          spell: input[:spell],
          data: {
            prepared_by: input[:target_spell_class],
            ready_to_use: input[:target_spell_class] != 'wizard'
          }
        )

        { result: result }
      end
    end
  end
end

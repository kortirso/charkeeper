# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class SpellAddCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd5::Character)
          required(:spell).filled(type?: ::Dnd5::Spell)
          required(:target_spell_class).filled(:string)
        end
      end

      private

      def do_persist(input)
        result = ::Dnd5::Character::Spell.create!(
          character: input[:character],
          spell: input[:spell],
          data: {
            prepared_by: input[:target_spell_class],
            ready_to_use: input[:target_spell_class] != ::Dnd5::Character::WIZARD
          }
        )

        { result: result }
      end
    end
  end
end

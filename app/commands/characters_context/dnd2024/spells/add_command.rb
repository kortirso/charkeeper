# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Spells
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :dnd5_character

          SpellAbilities = Dry::Types['strict.string'].enum('int', 'wis', 'cha')

          params do
            required(:character).filled(type?: ::Dnd2024::Character)
            required(:feat).filled(type?: ::Dnd2024::Feat)
            required(:target_spell_class).filled(:string)
            optional(:spell_ability).maybe(SpellAbilities)
          end
        end

        private

        def do_persist(input)
          result = ::Dnd2024::Character::Feat.create!(
            character: input[:character],
            feat: input[:feat],
            ready_to_use: input[:target_spell_class] != 'wizard',
            value: {
              prepared_by: input[:target_spell_class],
              spell_ability: input[:spell_ability]
            }.compact
          )

          { result: result }
        end
      end
    end
  end
end
